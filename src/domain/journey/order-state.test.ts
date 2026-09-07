import { describe, expect, it } from "vitest";
import { assertOrderTransition, canTransitionOrder } from "./order-state";

describe("order state machine", () => {
  it("allows only the reviewed happy-path transitions", () => {
    expect(canTransitionOrder("draft", "pending_approval")).toBe(false);
    expect(canTransitionOrder("approved", "accepted")).toBe(true);
    expect(canTransitionOrder("accepted", "paid")).toBe(true);
    expect(canTransitionOrder("approved", "superseded")).toBe(true);
    expect(canTransitionOrder("changes_requested", "superseded")).toBe(true);
    expect(canTransitionOrder("pending_approval", "approved")).toBe(true);
    expect(canTransitionOrder("pending_approval", "changes_requested")).toBe(
      true,
    );
    expect(canTransitionOrder("pending_approval", "rejected")).toBe(true);
  });

  it("rejects skips, reversals, and repeated terminal decisions", () => {
    expect(() => assertOrderTransition("draft", "approved")).toThrow();
    expect(() => assertOrderTransition("approved", "draft")).toThrow();
    expect(() => assertOrderTransition("approved", "approved")).toThrow();
    expect(() => assertOrderTransition("pending_approval", "paid")).toThrow();
    expect(() => assertOrderTransition("approved", "paid")).toThrow();
    expect(() => assertOrderTransition("accepted", "superseded")).toThrow();
    expect(() => assertOrderTransition("paid", "superseded")).toThrow();
    expect(() => assertOrderTransition("superseded", "approved")).toThrow();
    expect(() =>
      assertOrderTransition("rejected", "pending_approval"),
    ).toThrow();
  });
});
