import { describe, expect, it } from "vitest";
import { assertOrderTransition, canTransitionOrder } from "./order-state";

describe("order state machine", () => {
  it("allows only the reviewed happy-path transitions", () => {
    expect(canTransitionOrder("draft", "pending_approval")).toBe(true);
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
    expect(() =>
      assertOrderTransition("rejected", "pending_approval"),
    ).toThrow();
  });
});
