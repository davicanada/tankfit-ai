import type { OrderStatus } from "./types";

const allowedTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  draft: [], // Historical workflow-1 records are not migrated into new decisions.
  pending_approval: ["approved", "changes_requested", "rejected", "superseded"],
  approved: ["accepted", "superseded"],
  changes_requested: ["superseded"],
  rejected: ["superseded"],
  accepted: ["paid"],
  paid: [],
  superseded: [],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return allowedTransitions[from].includes(to);
}

export function assertOrderTransition(from: OrderStatus, to: OrderStatus) {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`Order cannot transition from ${from} to ${to}.`);
  }
}
