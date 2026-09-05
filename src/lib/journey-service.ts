import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
import { calculateRoi } from "@/domain/journey/roi";
import { evaluateJourney } from "@/domain/journey/evaluate";
import { assertOrderTransition } from "@/domain/journey/order-state";
import { UserFacingError } from "@/domain/journey/errors";
import {
  airFlameRequirementsSchema,
  defaultAirFlameRequirements,
  emptyRequirements,
  defaultRoiAssumptions,
  roiAssumptionsSchema,
  type CommerceSnapshot,
  type JourneyView,
  type OrderStatus,
} from "@/domain/journey/types";
import {
  commerceItems,
  demoEvents,
  demoOrders,
  demoProposals,
  demoSessions,
} from "@/db/schema";
import { getDb, getTransactionalDb } from "@/db";
import { catalog } from "@/lib/catalog";
import {
  demoSessionLifetimeMs,
  readSessionId,
  writeSessionId,
} from "@/lib/demo-session";

type Transaction = Parameters<
  Parameters<ReturnType<typeof getTransactionalDb>["transaction"]>[0]
>[0];
type Session = typeof demoSessions.$inferSelect;
type Order = typeof demoOrders.$inferSelect;

function commerceSnapshot(
  item: typeof commerceItems.$inferSelect,
): CommerceSnapshot {
  if (item.currency !== "CAD")
    throw new UserFacingError("Unsupported demo currency.");
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

async function event(
  tx: Transaction,
  sessionId: string,
  eventType: string,
  actor = "system",
  metadata: Record<string, unknown> = {},
  orderId?: string,
) {
  await tx.insert(demoEvents).values({
    id: randomUUID(),
    sessionId,
    orderId,
    eventType,
    actor,
    metadata,
  });
}

async function withSession<T>(
  sessionId: string,
  work: (tx: Transaction, session: Session) => Promise<T>,
): Promise<T> {
  return getTransactionalDb().transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL statement_timeout = '10s'`);
    const [session] = await tx
      .select()
      .from(demoSessions)
      .where(
        and(
          eq(demoSessions.id, sessionId),
          gt(demoSessions.expiresAt, new Date()),
        ),
      )
      .for("update");
    if (!session)
      throw new UserFacingError("Your demo session is missing or expired.");
    return work(tx, session);
  });
}

export async function recordSessionEvent(
  sessionId: string,
  eventType: string,
  metadata: Record<string, unknown>,
) {
  return withSession(sessionId, (tx) =>
    event(tx, sessionId, eventType, "system", metadata),
  );
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
    if (current) return current.id; // Fixed lifetime: reads never extend retention.
  }
  await db.delete(demoSessions).where(lt(demoSessions.expiresAt, now));
  const id = randomUUID();
  await db.insert(demoSessions).values({
    id,
    expiresAt: new Date(now.getTime() + demoSessionLifetimeMs),
    requirements: emptyRequirements,
    roiAssumptions: defaultRoiAssumptions,
  });
  await writeSessionId(id);
  await recordSessionEvent(id, "session_started", {});
  return id;
}

export async function requireDemoSession() {
  const id = await readSessionId();
  const session = id
    ? await getDb().query.demoSessions.findFirst({
        where: and(
          eq(demoSessions.id, id),
          gt(demoSessions.expiresAt, new Date()),
        ),
      })
    : undefined;
  if (!session)
    throw new UserFacingError("Your demo session is missing or expired.");
  return session;
}

export async function getCommerceSnapshot(productId?: string) {
  if (!productId) return null;
  const item = await getDb().query.commerceItems.findFirst({
    where: eq(commerceItems.productId, productId),
  });
  return item ? commerceSnapshot(item) : null;
}

export async function buildJourneyView(
  sessionId: string,
  staffMode: boolean,
): Promise<JourneyView> {
  const db = getDb();
  const session = await db.query.demoSessions.findFirst({
    where: and(
      eq(demoSessions.id, sessionId),
      gt(demoSessions.expiresAt, new Date()),
    ),
  });
  if (!session) throw new UserFacingError("Demo session not found.");
  const [commerce, order, events] = await Promise.all([
    getCommerceSnapshot(
      session.recommendationStatus === "compatible"
        ? (session.recommendationProductId ?? undefined)
        : undefined,
    ),
    db.query.demoOrders.findFirst({
      where: eq(demoOrders.sessionId, sessionId),
      orderBy: [desc(demoOrders.createdAt)],
    }),
    db.query.demoEvents.findMany({
      where: eq(demoEvents.sessionId, sessionId),
      orderBy: [asc(demoEvents.createdAt)],
      limit: 200,
    }),
  ]);
  const proposal =
    order?.status === "approved"
      ? await db.query.demoProposals.findFirst({
          where: and(
            eq(demoProposals.orderId, order.id),
            eq(demoProposals.sessionId, sessionId),
            gt(demoProposals.expiresAt, new Date()),
          ),
        })
      : undefined;
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
            order?.solutionSnapshot?.productName ??
            catalog.products.find(
              (p) => p.id === session.recommendationProductId,
            )?.name ??
            null,
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
          monthlyServiceCad: (order.monthlyServiceCents * order.quantity) / 100,
          fictionalDepositCad: order.fictionalDepositCents / 100,
          decisionNote: order.decisionNote,
          updatedAt: order.updatedAt.toISOString(),
        }
      : null,
    staffMode,
    proposalId: proposal?.id ?? null,
    conversation: session.discoveryMessages,
    events: events.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      actor: e.actor,
      createdAt: e.createdAt.toISOString(),
      metadata: e.metadata,
    })),
  };
}

async function confirmInTransaction(
  tx: Transaction,
  session: Session,
  rawRequirements: unknown,
  rawRoi: unknown,
) {
  const existing = await tx.query.demoOrders.findFirst({
    where: eq(demoOrders.sessionId, session.id),
  });
  if (existing)
    throw new UserFacingError(
      "This opportunity is frozen after order creation. Reset the demo to start a new revision.",
    );
  const requirements = airFlameRequirementsSchema.parse(rawRequirements);
  const roiAssumptions = roiAssumptionsSchema.parse(rawRoi);
  const compatibility = evaluateJourney(requirements);
  const productId = compatibility.primaryRecommendation?.product.id;
  const item =
    productId && compatibility.status === "compatible"
      ? await tx.query.commerceItems.findFirst({
          where: eq(commerceItems.productId, productId),
        })
      : undefined;
  const roiResult = item
    ? calculateRoi({
        fleetSize: requirements.fleetSize,
        assumptions: roiAssumptions,
        commerce: commerceSnapshot(item),
      })
    : null;
  const update = {
    requirements,
    roiAssumptions,
    roiResult,
    requirementsConfirmed: true,
    recommendationStatus: compatibility.status,
    recommendationProductId: productId ?? null,
    recommendationRuleVersion: compatibility.ruleVersion,
    recommendationReasons: compatibility.reasons,
    lastActiveAt: new Date(),
  };
  await tx
    .update(demoSessions)
    .set(update)
    .where(eq(demoSessions.id, session.id));
  await event(tx, session.id, "requirements_confirmed", "visitor", {
    status: compatibility.status,
    productId: productId ?? null,
    ruleVersion: compatibility.ruleVersion,
  });
  return { ...session, ...update };
}

export async function confirmRequirements(
  sessionId: string,
  requirements: unknown,
  roi: unknown,
) {
  return withSession(sessionId, (tx, session) =>
    confirmInTransaction(tx, session, requirements, roi),
  );
}

export async function saveDiscovery(
  sessionId: string,
  rawRequirements: unknown,
  messages: Session["discoveryMessages"],
  expectedMessages: Session["discoveryMessages"],
) {
  return withSession(sessionId, async (tx, session) => {
    if (
      JSON.stringify(session.discoveryMessages) !==
      JSON.stringify(expectedMessages)
    )
      throw new UserFacingError(
        "The conversation changed. Refresh before sending another message.",
      );
    const order = await tx.query.demoOrders.findFirst({
      where: eq(demoOrders.sessionId, sessionId),
    });
    if (order || session.requirementsConfirmed)
      throw new UserFacingError(
        "Requirements are already confirmed. Reset the demo to start a new conversation.",
      );
    await tx
      .update(demoSessions)
      .set({
        requirements: airFlameRequirementsSchema.parse(rawRequirements),
        discoveryMessages: messages,
      })
      .where(eq(demoSessions.id, sessionId));
  });
}

async function draftInTransaction(tx: Transaction, session: Session) {
  const existing = await tx.query.demoOrders.findFirst({
    where: eq(demoOrders.sessionId, session.id),
  });
  if (existing) return existing.id;
  const requirements = airFlameRequirementsSchema.parse(session.requirements);
  const compatibility = evaluateJourney(requirements);
  if (
    !session.requirementsConfirmed ||
    compatibility.status !== "compatible" ||
    !compatibility.primaryRecommendation
  )
    throw new UserFacingError(
      "Confirm a compatible recommendation before ordering.",
    );
  const item = await tx.query.commerceItems.findFirst({
    where: eq(
      commerceItems.productId,
      compatibility.primaryRecommendation.product.id,
    ),
  });
  if (
    !item ||
    item.currency !== "CAD" ||
    item.availability === "unavailable" ||
    item.stockQuantity < requirements.pilotQuantity
  )
    throw new UserFacingError(
      "Current commerce data cannot support this pilot quantity.",
    );
  const roiAssumptions = roiAssumptionsSchema.parse(session.roiAssumptions);
  const roi = calculateRoi({
    fleetSize: requirements.fleetSize,
    assumptions: roiAssumptions,
    commerce: commerceSnapshot(item),
  });
  const id = randomUUID();
  await tx.insert(demoOrders).values({
    id,
    sessionId: session.id,
    status: "draft",
    productId: item.productId,
    quantity: requirements.pilotQuantity,
    currency: item.currency,
    commerceVersion: item.commerceVersion,
    unitPriceCents: item.unitPriceCents,
    monthlyServiceCents: item.monthlyServiceCents,
    hardwareSubtotalCents: requirements.pilotQuantity * item.unitPriceCents,
    fictionalDepositCents: 25_000,
    leadTimeBusinessDays: item.leadTimeBusinessDays,
    solutionSnapshot: {
      requirements,
      roiAssumptions,
      roi,
      catalogVersion: catalog.catalogVersion,
      ruleVersion: compatibility.ruleVersion,
      productName: compatibility.primaryRecommendation.product.name,
      reasons: compatibility.primaryRecommendation.matchedFields,
    },
  });
  await tx
    .update(demoSessions)
    .set({ roiResult: roi })
    .where(eq(demoSessions.id, session.id));
  await event(
    tx,
    session.id,
    "draft_order_created",
    "visitor",
    {
      productId: item.productId,
      quantity: requirements.pilotQuantity,
      commerceVersion: item.commerceVersion,
    },
    id,
  );
  return id;
}

export async function createDraftOrder(sessionId: string) {
  return withSession(sessionId, draftInTransaction);
}

export async function prepareAirFlameOpportunity(sessionId: string) {
  return withSession(sessionId, async (tx, session) => {
    const existing = await tx.query.demoOrders.findFirst({
      where: eq(demoOrders.sessionId, sessionId),
    });
    if (existing) return existing.id;
    const confirmed = await confirmInTransaction(
      tx,
      session,
      defaultAirFlameRequirements,
      defaultRoiAssumptions,
    );
    const id = await draftInTransaction(tx, confirmed);
    await event(
      tx,
      sessionId,
      "prepared_sales_fixture",
      "visitor",
      { fixture: "airflame", version: "2026.09.1", paymentNotBypassed: true },
      id,
    );
    return id;
  });
}

async function validateCommerce(tx: Transaction, order: Order) {
  const [item] = await tx
    .select()
    .from(commerceItems)
    .where(eq(commerceItems.productId, order.productId))
    .for("share");
  if (
    !item ||
    item.availability === "unavailable" ||
    item.stockQuantity < order.quantity ||
    item.currency !== order.currency ||
    item.commerceVersion !== order.commerceVersion ||
    item.leadTimeBusinessDays !== order.leadTimeBusinessDays ||
    item.unitPriceCents !== order.unitPriceCents ||
    item.monthlyServiceCents !== order.monthlyServiceCents
  )
    throw new UserFacingError(
      "Commerce data changed. Reset the demo and create a new order with current values.",
    );
}

export async function readCheckoutOrder(sessionId: string, orderId: string) {
  return withSession(sessionId, async (tx) => {
    const order = await tx.query.demoOrders.findFirst({
      where: and(
        eq(demoOrders.id, orderId),
        eq(demoOrders.sessionId, sessionId),
      ),
    });
    if (!order || order.status !== "draft" || !order.solutionSnapshot)
      throw new UserFacingError(
        "Only a current draft can enter test checkout.",
      );
    await validateCommerce(tx, order);
    return order;
  });
}

export async function attachCheckout(
  sessionId: string,
  orderId: string,
  checkoutSessionId: string,
) {
  return withSession(sessionId, async (tx) => {
    const [order] = await tx
      .update(demoOrders)
      .set({ checkoutSessionId })
      .where(
        and(
          eq(demoOrders.id, orderId),
          eq(demoOrders.sessionId, sessionId),
          eq(demoOrders.status, "draft"),
        ),
      )
      .returning();
    if (!order) throw new UserFacingError("The draft is no longer available.");
    await event(tx, sessionId, "test_checkout_started", "visitor", {}, orderId);
  });
}

export async function completeVerifiedCheckout(
  sessionId: string,
  orderId: string,
  payment: {
    checkoutSessionId: string;
    amount: number;
    currency: string;
    livemode: boolean;
    paid: boolean;
  },
) {
  return withSession(sessionId, async (tx) => {
    const order = await tx.query.demoOrders.findFirst({
      where: and(
        eq(demoOrders.id, orderId),
        eq(demoOrders.sessionId, sessionId),
      ),
    });
    if (
      !order ||
      !order.solutionSnapshot ||
      payment.livemode ||
      !payment.paid ||
      order.checkoutSessionId !== payment.checkoutSessionId ||
      payment.amount !== order.fictionalDepositCents ||
      payment.currency.toUpperCase() !== order.currency
    )
      throw new UserFacingError("Test payment verification failed.");
    if (order.status !== "draft") return; // Verified duplicate callback: no duplicate events.
    await validateCommerce(tx, order);
    await tx
      .update(demoOrders)
      .set({
        status: "pending_approval",
        checkoutCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(demoOrders.id, order.id), eq(demoOrders.sessionId, sessionId)),
      );
    await event(
      tx,
      sessionId,
      "test_payment_verified",
      "system",
      {
        paymentProvider: "stripe_test",
        amountCents: payment.amount,
        currency: order.currency,
        realMoneyMoved: false,
      },
      orderId,
    );
    await event(
      tx,
      sessionId,
      "order_submitted_for_approval",
      "system",
      {},
      orderId,
    );
  });
}

export async function decideOrder(input: {
  sessionId: string;
  orderId: string;
  decision: "approved" | "changes_requested" | "rejected";
  note: string;
}) {
  return withSession(input.sessionId, async (tx, session) => {
    const order = await tx.query.demoOrders.findFirst({
      where: and(
        eq(demoOrders.id, input.orderId),
        eq(demoOrders.sessionId, input.sessionId),
      ),
    });
    if (
      !order ||
      !order.solutionSnapshot ||
      order.status !== "pending_approval"
    )
      throw new UserFacingError(
        "Only a verified pending order can receive a decision.",
      );
    assertOrderTransition(order.status as OrderStatus, input.decision);
    await tx
      .update(demoOrders)
      .set({
        status: input.decision,
        decisionNote: input.note || null,
        decidedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(demoOrders.id, order.id),
          eq(demoOrders.sessionId, input.sessionId),
        ),
      );
    await event(
      tx,
      session.id,
      `order_${input.decision}`,
      "demo_staff",
      { noteProvided: Boolean(input.note) },
      order.id,
    );
    if (input.decision === "approved") {
      await tx.insert(demoProposals).values({
        id: randomUUID(),
        orderId: order.id,
        sessionId: session.id,
        expiresAt: session.expiresAt,
      });
      await event(tx, session.id, "proposal_ready", "system", {}, order.id);
    }
  });
}

export async function getProposalData(proposalId: string, sessionId: string) {
  const db = getDb();
  const session = await db.query.demoSessions.findFirst({
    where: and(
      eq(demoSessions.id, sessionId),
      gt(demoSessions.expiresAt, new Date()),
    ),
  });
  if (!session) return null;
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
  if (!order?.solutionSnapshot) return null;
  return { proposal, order, snapshot: order.solutionSnapshot };
}

export async function resetDemoSession(sessionId: string) {
  await withSession(sessionId, async (tx) => {
    await tx.delete(demoSessions).where(eq(demoSessions.id, sessionId));
  });
}
