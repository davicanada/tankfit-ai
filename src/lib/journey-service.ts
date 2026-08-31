import "server-only";
import { randomUUID } from "node:crypto";
import { and, desc, eq, gt, lt } from "drizzle-orm";
import { evaluateCompatibility } from "@/domain/compatibility/evaluate";
import type { CompatibilityRequirements } from "@/domain/compatibility/types";
import { calculateRoi } from "@/domain/journey/roi";
import { assertOrderTransition } from "@/domain/journey/order-state";
import { UserFacingError } from "@/domain/journey/errors";
import {
  airFlameRequirementsSchema,
  defaultAirFlameRequirements,
  defaultRoiAssumptions,
  type AirFlameRequirements,
  type CommerceSnapshot,
  type JourneyView,
  type OrderStatus,
  roiAssumptionsSchema,
} from "@/domain/journey/types";
import {
  commerceItems,
  demoEvents,
  demoOrders,
  demoProposals,
  demoSessions,
} from "@/db/schema";
import { getDb } from "@/db";
import { catalog } from "@/lib/catalog";
import {
  demoSessionLifetimeMs,
  readSessionId,
  writeSessionId,
} from "@/lib/demo-session";

const PRIMARY_PRODUCT_ID = "TR-FL100";
const FICTIONAL_DEPOSIT_CENTS = 25_000;

function toCompatibilityRequirements(
  requirements: AirFlameRequirements,
): CompatibilityRequirements {
  return {
    material: requirements.material,
    tankType: requirements.tankType,
    existingInstrumentation: requirements.existingInstrumentation,
    gaugeInterface: requirements.gaugeInterface,
    connectivity: requirements.connectivity,
    siteDistribution: requirements.siteDistribution,
    measurementPreference: requirements.measurementPreference,
    regulatedLocation: requirements.regulatedLocation,
  };
}

function toCommerceSnapshot(
  item: typeof commerceItems.$inferSelect,
): CommerceSnapshot {
  return {
    productId: item.productId,
    commerceVersion: item.commerceVersion,
    currency: "CAD",
    unitPriceCad: item.unitPriceCents / 100,
    monthlyServiceCad: item.monthlyServiceCents / 100,
    stockQuantity: item.stockQuantity,
    availability: item.availability as CommerceSnapshot["availability"],
    leadTimeBusinessDays: item.leadTimeBusinessDays,
  };
}

async function addEvent(input: {
  sessionId: string;
  orderId?: string;
  eventType: string;
  actor: "visitor" | "demo_staff" | "system";
  metadata?: Record<string, unknown>;
}) {
  await getDb().insert(demoEvents).values({
    id: randomUUID(),
    sessionId: input.sessionId,
    orderId: input.orderId,
    eventType: input.eventType,
    actor: input.actor,
    metadata: input.metadata ?? {},
  });
}

export async function ensureDemoSession() {
  const db = getDb();
  const now = new Date();
  const currentId = await readSessionId();

  if (currentId) {
    const current = await db.query.demoSessions.findFirst({
      where: and(
        eq(demoSessions.id, currentId),
        gt(demoSessions.expiresAt, now),
      ),
    });
    if (current) {
      const expiresAt = new Date(now.getTime() + demoSessionLifetimeMs);
      await db
        .update(demoSessions)
        .set({ lastActiveAt: now, expiresAt })
        .where(eq(demoSessions.id, current.id));
      await writeSessionId(current.id);
      return current.id;
    }
  }

  await db.delete(demoSessions).where(lt(demoSessions.expiresAt, now));
  const sessionId = randomUUID();
  await db.insert(demoSessions).values({
    id: sessionId,
    expiresAt: new Date(now.getTime() + demoSessionLifetimeMs),
    requirements: defaultAirFlameRequirements,
    roiAssumptions: defaultRoiAssumptions,
  });
  await writeSessionId(sessionId);
  await addEvent({ sessionId, eventType: "session_started", actor: "system" });
  return sessionId;
}

export async function requireDemoSession() {
  const sessionId = await readSessionId();
  if (!sessionId) {
    throw new UserFacingError("Your demo session is missing or expired.");
  }
  const session = await getDb().query.demoSessions.findFirst({
    where: and(
      eq(demoSessions.id, sessionId),
      gt(demoSessions.expiresAt, new Date()),
    ),
  });
  if (!session) {
    throw new UserFacingError("Your demo session is missing or expired.");
  }
  return session;
}

export async function getCommerceSnapshot(productId = PRIMARY_PRODUCT_ID) {
  const item = await getDb().query.commerceItems.findFirst({
    where: eq(commerceItems.productId, productId),
  });
  return item ? toCommerceSnapshot(item) : null;
}

export async function buildJourneyView(
  sessionId: string,
  staffMode: boolean,
): Promise<JourneyView> {
  const db = getDb();
  const session = await db.query.demoSessions.findFirst({
    where: eq(demoSessions.id, sessionId),
  });
  if (!session) throw new UserFacingError("Demo session not found.");

  const [commerce, order] = await Promise.all([
    getCommerceSnapshot(),
    db.query.demoOrders.findFirst({
      where: eq(demoOrders.sessionId, sessionId),
      orderBy: [desc(demoOrders.createdAt)],
    }),
  ]);
  const proposal = order
    ? await db.query.demoProposals.findFirst({
        where: and(
          eq(demoProposals.orderId, order.id),
          gt(demoProposals.expiresAt, new Date()),
        ),
      })
    : null;

  return {
    sessionId,
    expiresAt: session.expiresAt.toISOString(),
    requirements: airFlameRequirementsSchema.parse(session.requirements),
    requirementsConfirmed: session.requirementsConfirmed,
    recommendation: session.recommendationStatus
      ? {
          status: session.recommendationStatus as NonNullable<
            JourneyView["recommendation"]
          >["status"],
          ruleVersion: session.recommendationRuleVersion ?? "unknown",
          productId: session.recommendationProductId,
          productName:
            catalog.products.find(
              (product) => product.id === session.recommendationProductId,
            )?.name ?? null,
          reasons: session.recommendationReasons ?? [],
        }
      : null,
    commerce,
    roiAssumptions: roiAssumptionsSchema.parse(session.roiAssumptions),
    roi: session.roiResult,
    order: order
      ? {
          id: order.id,
          status: order.status as OrderStatus,
          quantity: order.quantity,
          hardwareSubtotalCad: order.hardwareSubtotalCents / 100,
          monthlyServiceCad:
            (order.monthlyServiceCents * order.quantity) / 100,
          fictionalDepositCad: order.fictionalDepositCents / 100,
          decisionNote: order.decisionNote,
          updatedAt: order.updatedAt.toISOString(),
        }
      : null,
    staffMode,
    proposalId: proposal?.id ?? null,
  };
}

export async function confirmRequirements(
  sessionId: string,
  rawRequirements: unknown,
  rawRoiAssumptions: unknown,
) {
  const requirements = airFlameRequirementsSchema.parse(rawRequirements);
  const roiAssumptions = roiAssumptionsSchema.parse(rawRoiAssumptions);
  const compatibility = evaluateCompatibility(
    catalog.products,
    toCompatibilityRequirements(requirements),
  );
  const commerce = await getCommerceSnapshot(
    compatibility.primaryRecommendation?.product.id,
  );
  const roi = commerce
    ? calculateRoi({
        fleetSize: requirements.fleetSize,
        assumptions: roiAssumptions,
        commerce,
      })
    : null;

  await getDb().batch([
    getDb()
      .update(demoSessions)
      .set({
        requirements,
        requirementsConfirmed: true,
        recommendationStatus: compatibility.status,
        recommendationProductId:
          compatibility.primaryRecommendation?.product.id ?? null,
        recommendationRuleVersion: compatibility.ruleVersion,
        recommendationReasons: compatibility.reasons,
        roiAssumptions,
        roiResult: roi,
        lastActiveAt: new Date(),
      })
      .where(eq(demoSessions.id, sessionId)),
    getDb().insert(demoEvents).values({
      id: randomUUID(),
      sessionId,
      eventType: "requirements_confirmed",
      actor: "visitor",
      metadata: {
        compatibilityStatus: compatibility.status,
        productId: compatibility.primaryRecommendation?.product.id ?? null,
        ruleVersion: compatibility.ruleVersion,
      },
    }),
  ]);
}

export async function createDraftOrder(sessionId: string) {
  const db = getDb();
  const session = await db.query.demoSessions.findFirst({
    where: eq(demoSessions.id, sessionId),
  });
  if (
    !session?.requirementsConfirmed ||
    session.recommendationStatus !== "compatible" ||
    !session.recommendationProductId
  ) {
    throw new UserFacingError(
      "Confirm a compatible recommendation before ordering.",
    );
  }

  const requirements = airFlameRequirementsSchema.parse(session.requirements);
  const commerceRow = await db.query.commerceItems.findFirst({
    where: eq(commerceItems.productId, session.recommendationProductId),
  });
  if (!commerceRow) {
    throw new UserFacingError("Current commerce data is unavailable.");
  }
  if (
    commerceRow.availability === "unavailable" ||
    commerceRow.stockQuantity < requirements.pilotQuantity
  ) {
    throw new UserFacingError(
      "The requested pilot quantity is not currently available.",
    );
  }

  const existing = await db.query.demoOrders.findFirst({
    where: and(
      eq(demoOrders.sessionId, sessionId),
      eq(demoOrders.status, "draft"),
    ),
    orderBy: [desc(demoOrders.createdAt)],
  });
  if (existing) return existing.id;

  const orderId = randomUUID();
  await db.batch([
    db.insert(demoOrders).values({
      id: orderId,
      sessionId,
      status: "draft",
      productId: commerceRow.productId,
      quantity: requirements.pilotQuantity,
      currency: commerceRow.currency,
      commerceVersion: commerceRow.commerceVersion,
      unitPriceCents: commerceRow.unitPriceCents,
      monthlyServiceCents: commerceRow.monthlyServiceCents,
      hardwareSubtotalCents:
        requirements.pilotQuantity * commerceRow.unitPriceCents,
      fictionalDepositCents: FICTIONAL_DEPOSIT_CENTS,
      leadTimeBusinessDays: commerceRow.leadTimeBusinessDays,
    }),
    db.insert(demoEvents).values({
      id: randomUUID(),
      sessionId,
      orderId,
      eventType: "draft_order_created",
      actor: "visitor",
      metadata: {
        productId: commerceRow.productId,
        quantity: requirements.pilotQuantity,
        commerceVersion: commerceRow.commerceVersion,
      },
    }),
  ]);
  return orderId;
}

export async function submitFictionalCheckout(
  sessionId: string,
  orderId: string,
) {
  const db = getDb();
  const order = await db.query.demoOrders.findFirst({
    where: and(
      eq(demoOrders.id, orderId),
      eq(demoOrders.sessionId, sessionId),
    ),
  });
  if (!order || order.status !== "draft") {
    throw new UserFacingError(
      "Only a draft order can enter simulated checkout.",
    );
  }
  assertOrderTransition(order.status as OrderStatus, "pending_approval");

  const commerce = await db.query.commerceItems.findFirst({
    where: eq(commerceItems.productId, order.productId),
  });
  if (
    !commerce ||
    commerce.availability === "unavailable" ||
    commerce.stockQuantity < order.quantity ||
    commerce.unitPriceCents !== order.unitPriceCents ||
    commerce.monthlyServiceCents !== order.monthlyServiceCents
  ) {
    throw new UserFacingError(
      "Commerce data changed. Start a new order with the current catalog values.",
    );
  }

  const now = new Date();
  await db.batch([
    db
      .update(demoOrders)
      .set({
        status: "pending_approval",
        checkoutCompletedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(demoOrders.id, orderId),
          eq(demoOrders.sessionId, sessionId),
          eq(demoOrders.status, "draft"),
        ),
      ),
    db.insert(demoEvents).values({
      id: randomUUID(),
      sessionId,
      orderId,
      eventType: "fictional_deposit_authorized",
      actor: "visitor",
      metadata: {
        amountCents: order.fictionalDepositCents,
        currency: order.currency,
        paymentProvider: "internal_demo_adapter",
        realMoneyMoved: false,
      },
    }),
    db.insert(demoEvents).values({
      id: randomUUID(),
      sessionId,
      orderId,
      eventType: "order_submitted_for_approval",
      actor: "system",
      metadata: {},
    }),
  ]);
}

export async function decideOrder(input: {
  sessionId: string;
  orderId: string;
  decision: "approved" | "changes_requested" | "rejected";
  note: string;
}) {
  const db = getDb();
  const order = await db.query.demoOrders.findFirst({
    where: and(
      eq(demoOrders.id, input.orderId),
      eq(demoOrders.sessionId, input.sessionId),
    ),
  });
  if (!order || order.status !== "pending_approval") {
    throw new UserFacingError(
      "Only a pending order can receive a decision.",
    );
  }
  assertOrderTransition(order.status as OrderStatus, input.decision);

  const now = new Date();
  const operations = [
    db
      .update(demoOrders)
      .set({
        status: input.decision,
        decisionNote: input.note || null,
        decidedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(demoOrders.id, input.orderId),
          eq(demoOrders.sessionId, input.sessionId),
          eq(demoOrders.status, "pending_approval"),
        ),
      ),
    db.insert(demoEvents).values({
      id: randomUUID(),
      sessionId: input.sessionId,
      orderId: input.orderId,
      eventType: `order_${input.decision}`,
      actor: "demo_staff",
      metadata: { noteProvided: Boolean(input.note) },
    }),
  ] as const;

  await db.batch(operations);

  if (input.decision === "approved") {
    const proposalId = randomUUID();
    await db
      .insert(demoProposals)
      .values({
        id: proposalId,
        orderId: input.orderId,
        sessionId: input.sessionId,
        expiresAt: new Date(now.getTime() + demoSessionLifetimeMs),
      })
      .onConflictDoNothing({ target: demoProposals.orderId });
    await addEvent({
      sessionId: input.sessionId,
      orderId: input.orderId,
      eventType: "proposal_ready",
      actor: "system",
      metadata: {},
    });
  }
}

export async function getProposalData(proposalId: string, sessionId: string) {
  const db = getDb();
  const proposal = await db.query.demoProposals.findFirst({
    where: and(
      eq(demoProposals.id, proposalId),
      eq(demoProposals.sessionId, sessionId),
      gt(demoProposals.expiresAt, new Date()),
    ),
  });
  if (!proposal) return null;
  const order = await db.query.demoOrders.findFirst({
    where: and(
      eq(demoOrders.id, proposal.orderId),
      eq(demoOrders.sessionId, sessionId),
      eq(demoOrders.status, "approved"),
    ),
  });
  if (!order) return null;
  const session = await db.query.demoSessions.findFirst({
    where: eq(demoSessions.id, sessionId),
  });
  if (!session) return null;
  return { proposal, order, session };
}

export async function resetDemoSession(sessionId: string) {
  await getDb().delete(demoSessions).where(eq(demoSessions.id, sessionId));
}
