import type { OrderStatus } from "./types";

const allowedTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  draft: ["pending_approval"],
  pending_approval: ["approved", "changes_requested", "rejected"],
  approved: [],
  changes_requested: [],
  rejected: [],
};

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
) {
  return allowedTransitions[from].includes(to);
}

export function assertOrderTransition(from: OrderStatus, to: OrderStatus) {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`Order cannot transition from ${from} to ${to}.`);
  }
}
