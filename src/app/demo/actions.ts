"use server";

import { z } from "zod";
import {
  airFlameRequirementsSchema,
  roiAssumptionsSchema,
  businessBriefSchema,
  type JourneyView,
} from "@/domain/journey/types";
import { UserFacingError } from "@/domain/journey/errors";
import {
  buildJourneyView,
  confirmRequirements,
  createDraftOrder,
  decideOrder,
  ensureDemoSession,
  requireDemoSession as readActionSession,
  resetDemoSession,
  prepareAirFlameOpportunity,
  recordSessionEvent,
  requestSalesReview,
  acceptProposal,
  reviseRequest,
} from "@/lib/journey-service";
import {
  clearStaffToken,
  readStaffClaims,
  writeStaffToken,
} from "@/lib/demo-session";
import { extractAirFlameBrief } from "@/lib/ai/discovery";
import { reserveDailyAiRequest } from "@/lib/ai/usage-budget";
import {
  beginTestCheckout,
  reconcileTestCheckout,
} from "@/lib/payments/stripe";
import { assertActionOrigin } from "@/lib/action-security";

async function requireDemoSession() {
  await assertActionOrigin();
  return readActionSession();
}

type ActionResult =
  | { ok: true; view: JourneyView; checkoutUrl?: string }
  | { ok: false; error: string };

function safeMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Some values are invalid.";
  }
  if (error instanceof UserFacingError) return error.message;
  return "The demo could not complete that step.";
}

async function currentView(sessionId: string) {
  const claims = await readStaffClaims();
  const baseView = await buildJourneyView(sessionId, false);
  const staffMode = Boolean(
    claims &&
    claims.sessionId === sessionId &&
    claims.orderId === baseView.order?.id,
  );
  return staffMode ? buildJourneyView(sessionId, true) : baseView;
}

export async function initializeJourneyAction(): Promise<ActionResult> {
  try {
    await assertActionOrigin();
    const sessionId = await ensureDemoSession();
    return { ok: true, view: await currentView(sessionId) };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

const discoveryInputSchema = z
  .object({
    brief: z.string().trim().min(20).max(2_000),
    currentRequirements: airFlameRequirementsSchema,
  })
  .strict();

export async function analyzeBriefAction(input: {
  brief: string;
  currentRequirements: unknown;
}): Promise<
  | {
      ok: true;
      requirements: z.infer<typeof airFlameRequirementsSchema>;
      mode: "ai" | "deterministic";
      provider: string | null;
    }
  | { ok: false; error: string }
> {
  try {
    const session = await requireDemoSession();
    const parsed = discoveryInputSchema.parse(input);
    const aiAllowed = await reserveDailyAiRequest("discovery").catch(
      () => false,
    );
    const result = await extractAirFlameBrief({
      brief: parsed.brief,
      current: parsed.currentRequirements,
      aiAllowed,
    });
    await recordSessionEvent(session.id, "discovery_completed", {
      mode: result.mode,
      provider: result.provider,
      ...result.usage,
      estimatedCostUsd: null,
      costStatus: "Provider billing unavailable; request caps enforced",
      requirements: result.requirements,
    });
    return { ok: true, ...result };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

export async function confirmRequirementsAction(input: {
  requirements: unknown;
  roiAssumptions: unknown;
  businessBrief?: unknown;
}): Promise<ActionResult> {
  try {
    const session = await requireDemoSession();
    const requirements = airFlameRequirementsSchema.parse(input.requirements);
    const roiAssumptions = roiAssumptionsSchema.parse(input.roiAssumptions);
    const brief =
      input.businessBrief === undefined
        ? undefined
        : businessBriefSchema.parse(input.businessBrief);
    await confirmRequirements(session.id, requirements, roiAssumptions, brief);
    return { ok: true, view: await currentView(session.id) };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

export async function createOrderAction(): Promise<ActionResult> {
  try {
    const session = await requireDemoSession();
    await createDraftOrder(session.id);
    return { ok: true, view: await currentView(session.id) };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

const orderInputSchema = z.object({ orderId: z.string().uuid() }).strict();

export async function checkoutAction(input: {
  orderId: string;
}): Promise<ActionResult> {
  try {
    const { orderId } = orderInputSchema.parse(input);
    const session = await requireDemoSession();
    const checkoutUrl = await beginTestCheckout(session.id, orderId);
    return { ok: true, view: await currentView(session.id), checkoutUrl };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

export async function reconcileCheckoutAction(): Promise<ActionResult> {
  try {
    const session = await requireDemoSession();
    await reconcileTestCheckout(session.id);
    return { ok: true, view: await currentView(session.id) };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

export async function prepareOpportunityAction(): Promise<ActionResult> {
  try {
    const session = await requireDemoSession();
    await prepareAirFlameOpportunity(session.id);
    return { ok: true, view: await currentView(session.id) };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

export async function enterStaffModeAction(input: {
  orderId: string;
}): Promise<ActionResult> {
  try {
    const { orderId } = orderInputSchema.parse(input);
    const session = await requireDemoSession();
    const view = await buildJourneyView(session.id, false);
    if (
      view.order?.id !== orderId ||
      view.order.workflowVersion !== 2 ||
      view.order.status !== "pending_approval"
    ) {
      throw new UserFacingError(
        "This order is not waiting for a demo decision.",
      );
    }
    await recordSessionEvent(session.id, "demo_staff_mode_entered", {
      orderId,
    });
    await writeStaffToken(session.id, orderId);
    return { ok: true, view: await buildJourneyView(session.id, true) };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

const decisionInputSchema = z
  .object({
    orderId: z.string().uuid(),
    decision: z.enum(["approved", "changes_requested", "rejected"]),
    note: z.string().trim().min(1, "Enter a decision note.").max(500),
  })
  .strict();

export async function decideOrderAction(input: {
  orderId: string;
  decision: "approved" | "changes_requested" | "rejected";
  note: string;
}): Promise<ActionResult> {
  try {
    const parsed = decisionInputSchema.parse(input);
    const session = await requireDemoSession();
    const claims = await readStaffClaims();
    if (
      !claims ||
      claims.sessionId !== session.id ||
      claims.orderId !== parsed.orderId
    ) {
      throw new UserFacingError("Demo Staff Mode is missing or expired.");
    }
    await decideOrder({ sessionId: session.id, ...parsed });
    await clearStaffToken();
    return { ok: true, view: await buildJourneyView(session.id, false) };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

export async function exitStaffModeAction(): Promise<ActionResult> {
  try {
    const session = await requireDemoSession();
    await recordSessionEvent(session.id, "demo_staff_mode_exited", {});
    await clearStaffToken();
    return { ok: true, view: await buildJourneyView(session.id, false) };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

export async function requestSalesReviewAction(input: {
  requirements: unknown;
  businessBrief: unknown;
}): Promise<ActionResult> {
  try {
    const session = await requireDemoSession();
    const parsed = z
      .object({
        requirements: airFlameRequirementsSchema,
        businessBrief: businessBriefSchema,
      })
      .strict()
      .parse(input);
    await requestSalesReview(
      session.id,
      parsed.requirements,
      parsed.businessBrief,
    );
    return { ok: true, view: await currentView(session.id) };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

export async function acceptProposalAction(input: {
  orderId: string;
}): Promise<ActionResult> {
  try {
    const session = await requireDemoSession();
    const { orderId } = orderInputSchema.parse(input);
    await acceptProposal(session.id, orderId);
    return { ok: true, view: await currentView(session.id) };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

export async function reviseRequestAction(input: {
  orderId: string;
}): Promise<ActionResult> {
  try {
    const session = await requireDemoSession();
    const { orderId } = orderInputSchema.parse(input);
    await reviseRequest(session.id, orderId);
    await clearStaffToken();
    return { ok: true, view: await currentView(session.id) };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

export async function resetJourneyAction(): Promise<ActionResult> {
  try {
    const session = await requireDemoSession();
    await resetDemoSession(session.id);
    await clearStaffToken();
    const newSessionId = await ensureDemoSession();
    return { ok: true, view: await buildJourneyView(newSessionId, false) };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}
