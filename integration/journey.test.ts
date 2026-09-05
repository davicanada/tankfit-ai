import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { demoSessions, demoOrders, demoEvents } from "@/db/schema";
import {
  defaultAirFlameRequirements,
  defaultRoiAssumptions,
} from "@/domain/journey/types";
import {
  confirmRequirements,
  createDraftOrder,
  attachCheckout,
  completeVerifiedCheckout,
  decideOrder,
  getProposalData,
  buildJourneyView,
  prepareAirFlameOpportunity,
} from "@/lib/journey-service";

const sessions = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
const [owner, foreign, expired, approvedOwner] = sessions;
describe("isolated Postgres journey boundaries", () => {
  beforeAll(async () => {
    if (!process.env.DATABASE_URL)
      throw new Error("Integration tests require a configured test database.");
    for (const id of sessions)
      await getDb()
        .insert(demoSessions)
        .values({
          id,
          requirements: defaultAirFlameRequirements,
          roiAssumptions: defaultRoiAssumptions,
          expiresAt: new Date(
            Date.now() + (id === expired ? -60_000 : 3_600_000),
          ),
        });
  });
  afterAll(async () => {
    // Delete only exact UUIDs created by this test run, never shared catalog rows.
    for (const id of sessions)
      await getDb().delete(demoSessions).where(eq(demoSessions.id, id));
  });
  it("serializes duplicate drafts, freezes scope, isolates and gates proposals", async () => {
    await confirmRequirements(
      owner,
      defaultAirFlameRequirements,
      defaultRoiAssumptions,
    );
    const orders = await Promise.all([
      createDraftOrder(owner),
      createDraftOrder(owner),
    ]);
    expect(orders[0]).toBe(orders[1]);
    await expect(
      confirmRequirements(
        owner,
        { ...defaultAirFlameRequirements, fleetSize: 999 },
        defaultRoiAssumptions,
      ),
    ).rejects.toThrow("frozen");
    await expect(
      decideOrder({
        sessionId: owner,
        orderId: orders[0],
        decision: "approved",
        note: "Premature approval",
      }),
    ).rejects.toThrow();
    await expect(
      attachCheckout(foreign, orders[0], "cs_test_foreign"),
    ).rejects.toThrow();
    const checkoutSessionId = `cs_test_${randomUUID()}`;
    await attachCheckout(owner, orders[0], checkoutSessionId);
    const payment = {
      checkoutSessionId,
      amount: 25_000,
      currency: "cad",
      paid: true,
      livemode: false,
    };
    await expect(
      completeVerifiedCheckout(owner, orders[0], {
        ...payment,
        livemode: true,
      }),
    ).rejects.toThrow();
    await expect(
      completeVerifiedCheckout(owner, orders[0], { ...payment, amount: 1 }),
    ).rejects.toThrow();
    await expect(
      completeVerifiedCheckout(owner, orders[0], { ...payment, paid: false }),
    ).rejects.toThrow();
    await Promise.all([
      completeVerifiedCheckout(owner, orders[0], payment),
      completeVerifiedCheckout(owner, orders[0], payment),
    ]);
    const events = await getDb().query.demoEvents.findMany({
      where: eq(demoEvents.sessionId, owner),
    });
    expect(
      events.filter((e) => e.eventType === "test_payment_verified"),
    ).toHaveLength(1);
    await expect(
      decideOrder({
        sessionId: foreign,
        orderId: orders[0],
        decision: "approved",
        note: "Foreign attempt",
      }),
    ).rejects.toThrow();
    const decisions = await Promise.allSettled([
      decideOrder({
        sessionId: owner,
        orderId: orders[0],
        decision: "approved",
        note: "Synthetic test approval",
      }),
      decideOrder({
        sessionId: owner,
        orderId: orders[0],
        decision: "rejected",
        note: "Racing decision",
      }),
    ]);
    expect(
      decisions.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    const view = await buildJourneyView(owner, false);
    if (view.proposalId) {
      expect(await getProposalData(view.proposalId, foreign)).toBeNull();
      const data = await getProposalData(view.proposalId, owner);
      expect(data?.snapshot.requirements.fleetSize).toBe(500);
      await getDb()
        .update(demoSessions)
        .set({ expiresAt: new Date(Date.now() - 1000) })
        .where(eq(demoSessions.id, owner));
      expect(await getProposalData(view.proposalId, owner)).toBeNull();
    }
  });
  it("always verifies an approved immutable snapshot and expiry", async () => {
    await confirmRequirements(
      approvedOwner,
      defaultAirFlameRequirements,
      defaultRoiAssumptions,
    );
    const orderId = await createDraftOrder(approvedOwner);
    const checkoutSessionId = `cs_test_${randomUUID()}`;
    await attachCheckout(approvedOwner, orderId, checkoutSessionId);
    await completeVerifiedCheckout(approvedOwner, orderId, {
      checkoutSessionId,
      amount: 25_000,
      currency: "cad",
      paid: true,
      livemode: false,
    });
    await decideOrder({
      sessionId: approvedOwner,
      orderId,
      decision: "approved",
      note: "Synthetic integration approval",
    });
    const view = await buildJourneyView(approvedOwner, false);
    expect(view.proposalId).toBeTruthy();
    const proposalId = view.proposalId!;
    const data = await getProposalData(proposalId, approvedOwner);
    expect(data?.snapshot.requirements).toEqual(defaultAirFlameRequirements);
    expect(await getProposalData(proposalId, foreign)).toBeNull();
    await getDb()
      .update(demoSessions)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(demoSessions.id, approvedOwner));
    expect(await getProposalData(proposalId, approvedOwner)).toBeNull();
  });
  it("creates a private prepared fixture once and denies expired sessions", async () => {
    const ids = await Promise.all([
      prepareAirFlameOpportunity(foreign),
      prepareAirFlameOpportunity(foreign),
    ]);
    expect(ids[0]).toBe(ids[1]);
    const order = await getDb().query.demoOrders.findFirst({
      where: eq(demoOrders.id, ids[0]),
    });
    expect(order?.sessionId).toBe(foreign);
    expect(order?.status).toBe("draft");
    const events = await getDb().query.demoEvents.findMany({
      where: eq(demoEvents.sessionId, foreign),
    });
    expect(
      events.filter((e) => e.eventType === "prepared_sales_fixture"),
    ).toHaveLength(1);
    await expect(createDraftOrder(expired)).rejects.toThrow("expired");
  });
});
