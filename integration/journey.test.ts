import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { demoSessions, demoOrders, demoEvents } from "@/db/schema";
import {
  defaultAirFlameRequirements,
  defaultRoiAssumptions,
  emptyRequirements,
  emptyBusinessBrief,
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
  acceptProposal,
  reviseRequest,
  requestSalesReview,
  readCheckoutOrder,
} from "@/lib/journey-service";

const sessions = Array.from({ length: 9 }, () => randomUUID());
const [
  owner,
  foreign,
  expired,
  revisionOwner,
  incomplete,
  raceOwner,
  legacyOwner,
  changesOwner,
  staleOwner,
] = sessions;
async function submit(id: string) {
  await confirmRequirements(
    id,
    defaultAirFlameRequirements,
    defaultRoiAssumptions,
  );
  return createDraftOrder(id);
}
async function approve(id: string, orderId: string) {
  await decideOrder({
    sessionId: id,
    orderId,
    decision: "approved",
    note: "Synthetic five-site pilot reviewed.",
  });
}
describe("consultative Postgres lifecycle", () => {
  beforeAll(async () => {
    if (!process.env.DATABASE_URL)
      throw new Error("Integration tests require a configured test database.");
    for (const id of sessions)
      await getDb()
        .insert(demoSessions)
        .values({
          id,
          requirements: emptyRequirements,
          roiAssumptions: defaultRoiAssumptions,
          expiresAt: new Date(
            Date.now() + (id === expired ? -60_000 : 3_600_000),
          ),
        });
  });
  afterAll(async () => {
    // Exact UUIDs created above; never delete shared commerce rows.
    for (const id of sessions)
      await getDb().delete(demoSessions).where(eq(demoSessions.id, id));
  });

  it("requires approved proposal acceptance before checkout and verifies payment exactly once", async () => {
    await confirmRequirements(
      owner,
      defaultAirFlameRequirements,
      defaultRoiAssumptions,
    );
    const ids = await Promise.all([
      createDraftOrder(owner),
      createDraftOrder(owner),
    ]);
    expect(ids[0]).toBe(ids[1]);
    const orderId = ids[0];
    expect((await buildJourneyView(owner, false)).order?.status).toBe(
      "pending_approval",
    );
    await expect(
      confirmRequirements(
        owner,
        { ...defaultAirFlameRequirements, fleetSize: 999 },
        defaultRoiAssumptions,
      ),
    ).rejects.toThrow("frozen");
    await expect(readCheckoutOrder(owner, orderId)).rejects.toThrow();
    await expect(
      attachCheckout(owner, orderId, "cs_test_early"),
    ).rejects.toThrow();
    await expect(acceptProposal(owner, orderId)).rejects.toThrow();
    expect((await buildJourneyView(owner, false)).proposalId).toBeNull();
    await expect(approve(foreign, orderId)).rejects.toThrow();
    await approve(owner, orderId);
    const approved = await buildJourneyView(owner, false);
    expect(approved.proposalId).toBeTruthy();
    expect(await getProposalData(approved.proposalId!, foreign)).toBeNull();
    expect(
      (await getProposalData(approved.proposalId!, owner))?.snapshot
        .requirements.fleetSize,
    ).toBe(500);
    expect(
      (await getProposalData(approved.proposalId!, owner))?.snapshot.roi
        .estimatedPaybackMonths,
    ).toBeNull();
    await expect(readCheckoutOrder(owner, orderId)).rejects.toThrow();
    await expect(acceptProposal(foreign, orderId)).rejects.toThrow();
    await Promise.all([
      acceptProposal(owner, orderId),
      acceptProposal(owner, orderId),
    ]);
    expect((await readCheckoutOrder(owner, orderId)).status).toBe("accepted");
    await expect(reviseRequest(owner, orderId)).rejects.toThrow();
    const checkoutSessionId = `cs_test_${randomUUID()}`;
    await expect(
      attachCheckout(foreign, orderId, checkoutSessionId),
    ).rejects.toThrow();
    await Promise.all([
      attachCheckout(owner, orderId, checkoutSessionId),
      attachCheckout(owner, orderId, checkoutSessionId),
    ]);
    await expect(
      attachCheckout(owner, orderId, "cs_test_replacement"),
    ).rejects.toThrow();
    const payment = {
      checkoutSessionId,
      amount: 25_000,
      currency: "cad",
      paid: true,
      livemode: false,
    };
    for (const invalid of [
      { livemode: true },
      { paid: false },
      { amount: 1 },
      { currency: "usd" },
      { checkoutSessionId: "cs_test_wrong" },
    ]) {
      await expect(
        completeVerifiedCheckout(owner, orderId, { ...payment, ...invalid }),
      ).rejects.toThrow();
    }
    await expect(
      completeVerifiedCheckout(foreign, orderId, payment),
    ).rejects.toThrow();
    await Promise.all([
      completeVerifiedCheckout(owner, orderId, payment),
      completeVerifiedCheckout(owner, orderId, payment),
    ]);
    const paid = await buildJourneyView(owner, false);
    expect(paid.order?.status).toBe("paid");
    expect(paid.proposalId).toBe(approved.proposalId);
    expect(await getProposalData(paid.proposalId!, owner)).toBeTruthy();
    for (const type of [
      "pilot_request_submitted",
      "proposal_accepted",
      "test_checkout_started",
      "test_payment_verified",
    ])
      expect(
        paid.events.filter((event) => event.eventType === type),
      ).toHaveLength(1);
    await expect(reviseRequest(owner, orderId)).rejects.toThrow();
    await getDb()
      .update(demoSessions)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(demoSessions.id, owner));
    expect(await getProposalData(paid.proposalId!, owner)).toBeNull();
  });

  it("preserves approved snapshots and conversation while requiring fresh revision approval", async () => {
    const first = await submit(revisionOwner);
    await approve(revisionOwner, first);
    const before = await buildJourneyView(revisionOwner, false);
    await getDb()
      .update(demoSessions)
      .set({
        discoveryMessages: [{ role: "user", content: "A fictional pilot." }],
      })
      .where(eq(demoSessions.id, revisionOwner));
    await expect(reviseRequest(foreign, first)).rejects.toThrow();
    await reviseRequest(revisionOwner, first);
    expect(await getProposalData(before.proposalId!, revisionOwner)).toBeNull();
    await expect(acceptProposal(revisionOwner, first)).rejects.toThrow();
    await expect(approve(revisionOwner, first)).rejects.toThrow();
    const open = await buildJourneyView(revisionOwner, false);
    expect(open.order).toBeNull();
    expect(open.requirementsConfirmed).toBe(false);
    expect(open.conversation).toHaveLength(1);
    await confirmRequirements(
      revisionOwner,
      { ...defaultAirFlameRequirements, pilotQuantity: 3 },
      defaultRoiAssumptions,
    );
    const second = await createDraftOrder(revisionOwner);
    expect(second).not.toBe(first);
    const revised = await buildJourneyView(revisionOwner, false);
    expect(revised.order?.revision).toBe(2);
    expect(revised.order?.status).toBe("pending_approval");
    expect(revised.proposalId).toBeNull();
    const old = await getDb().query.demoOrders.findFirst({
      where: eq(demoOrders.id, first),
    });
    expect(old?.solutionSnapshot?.requirements.pilotQuantity).toBe(5);
    expect(old?.decisionNote).toBeTruthy();
    expect(old?.status).toBe("superseded");
  });

  it("hands off incomplete facts without creating a request, approval or payment", async () => {
    const brief = {
      objective: "Reduce manual checks",
      timeline: "This quarter",
      successCriteria: "Compare manual checks before and during the pilot",
    };
    await requestSalesReview(
      incomplete,
      { ...emptyRequirements, material: "heating_oil" },
      brief,
    );
    const view = await buildJourneyView(incomplete, false);
    expect(view.salesRequested).toBe(true);
    expect(view.businessBrief).toEqual(brief);
    expect(view.requirements.gaugeInterface).toBe("unknown");
    expect(view.order).toBeNull();
    expect(view.proposalId).toBeNull();
    await expect(createDraftOrder(incomplete)).rejects.toThrow();
    await expect(
      requestSalesReview(incomplete, emptyRequirements, {
        ...emptyBusinessBrief,
        objective: "x".repeat(501),
      }),
    ).rejects.toThrow();
  });

  it("serializes conflicting Sales decisions and acceptance versus revision", async () => {
    const first = await submit(raceOwner);
    const decisions = await Promise.allSettled([
      approve(raceOwner, first),
      decideOrder({
        sessionId: raceOwner,
        orderId: first,
        decision: "rejected",
        note: "Alternate review",
      }),
    ]);
    expect(
      decisions.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    await reviseRequest(raceOwner, first);
    const second = await submit(raceOwner);
    await approve(raceOwner, second);
    const race = await Promise.allSettled([
      acceptProposal(raceOwner, second),
      reviseRequest(raceOwner, second),
    ]);
    expect(race.filter((result) => result.status === "fulfilled")).toHaveLength(
      1,
    );
  });

  it("allows a change-request revision without resetting the session", async () => {
    const orderId = await submit(changesOwner);
    await decideOrder({
      sessionId: changesOwner,
      orderId,
      decision: "changes_requested",
      note: "Clarify the pilot quantity.",
    });
    expect((await buildJourneyView(changesOwner, false)).proposalId).toBeNull();
    await reviseRequest(changesOwner, orderId);
    const next = await submit(changesOwner);
    expect(next).not.toBe(orderId);
    expect(
      (await buildJourneyView(changesOwner, false)).revisions,
    ).toHaveLength(2);
  });

  it("creates a private prepared fixture once and denies expired and legacy mutations", async () => {
    const ids = await Promise.all([
      prepareAirFlameOpportunity(foreign),
      prepareAirFlameOpportunity(foreign),
    ]);
    expect(ids[0]).toBe(ids[1]);
    const view = await buildJourneyView(foreign, false);
    expect(view.order?.status).toBe("pending_approval");
    expect(
      view.events.filter(
        (event) => event.eventType === "prepared_sales_fixture",
      ),
    ).toHaveLength(1);
    await expect(createDraftOrder(expired)).rejects.toThrow("expired");
    const legacy = await submit(legacyOwner);
    await getDb()
      .update(demoOrders)
      .set({ workflowVersion: 1 })
      .where(eq(demoOrders.id, legacy));
    await expect(approve(legacyOwner, legacy)).rejects.toThrow();
    await expect(acceptProposal(legacyOwner, legacy)).rejects.toThrow();
    await expect(readCheckoutOrder(legacyOwner, legacy)).rejects.toThrow();
    await expect(reviseRequest(legacyOwner, legacy)).rejects.toThrow();
  });

  it("rejects changed commerce before approval and checkout without modifying catalog rows", async () => {
    const orderId = await submit(staleOwner);
    // Tamper only with this test-owned frozen row to represent a stale snapshot.
    await getDb()
      .update(demoOrders)
      .set({ commerceVersion: "stale" })
      .where(eq(demoOrders.id, orderId));
    await expect(approve(staleOwner, orderId)).rejects.toThrow(
      "Commerce data changed",
    );
    expect((await buildJourneyView(staleOwner, false)).proposalId).toBeNull();
    const events = await getDb().query.demoEvents.findMany({
      where: eq(demoEvents.sessionId, staleOwner),
    });
    expect(events.some((event) => event.eventType === "order_approved")).toBe(
      false,
    );
  });
});
