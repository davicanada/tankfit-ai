"use server";

import { z } from "zod";
import {
  airFlameRequirementsSchema,
  roiAssumptionsSchema,
  type JourneyView,
} from "@/domain/journey/types";
import { UserFacingError } from "@/domain/journey/errors";
import {
  buildJourneyView,
  confirmRequirements,
  createDraftOrder,
  decideOrder,
  ensureDemoSession,
  requireDemoSession,
  resetDemoSession,
  submitFictionalCheckout,
} from "@/lib/journey-service";
import {
  clearStaffToken,
  readStaffClaims,
  writeStaffToken,
} from "@/lib/demo-session";
import { extractAirFlameBrief } from "@/lib/ai/discovery";
import { reserveDailyAiRequest } from "@/lib/ai/usage-budget";

type ActionResult =
  | { ok: true; view: JourneyView }
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
  return staffMode
    ? buildJourneyView(sessionId, true)
    : baseView;
}

export async function initializeJourneyAction(): Promise<ActionResult> {
  try {
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
    await requireDemoSession();
    const parsed = discoveryInputSchema.parse(input);
    const aiAllowed = await reserveDailyAiRequest("discovery").catch(
      () => false,
    );
    const result = await extractAirFlameBrief({
      brief: parsed.brief,
      current: parsed.currentRequirements,
      aiAllowed,
    });
    return { ok: true, ...result };
  } catch (error) {
    return { ok: false, error: safeMessage(error) };
  }
}

export async function confirmRequirementsAction(input: {
  requirements: unknown;
  roiAssumptions: unknown;
}): Promise<ActionResult> {
  try {
    const session = await requireDemoSession();
    const requirements = airFlameRequirementsSchema.parse(input.requirements);
    const roiAssumptions = roiAssumptionsSchema.parse(input.roiAssumptions);
    await confirmRequirements(session.id, requirements, roiAssumptions);
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
    await submitFictionalCheckout(session.id, orderId);
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
    if (view.order?.id !== orderId || view.order.status !== "pending_approval") {
      throw new UserFacingError(
        "This order is not waiting for a demo decision.",
      );
    }
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
    note: z.string().trim().max(500),
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
    await clearStaffToken();
    return { ok: true, view: await buildJourneyView(session.id, false) };
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
