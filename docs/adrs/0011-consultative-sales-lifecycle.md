# ADR-0011: Consultative sales before payment

**Status:** Accepted for implementation; Davi Almeida reviews the diff before merge
**Date:** September 6, 2026

## Context

Maya Chen needs her team to review incomplete opportunities and approve a
proposal before asking a customer to pay. The previous demo collected a deposit
before approval and required a reset for revisions. Its payback calculation
ignored recurring service costs after year one. The owner accepted the critical
workflow review and these corrections.

## Decision

Follow `specs/consultative-sales.md`. Version new commercial records as workflow
2. A validated request starts in `pending_approval`; staff approval issues the
proposal; explicit customer acceptance enables test Checkout; a verified test
payment ends in `paid`. Payment does not grant approval or create another
proposal. Every proposal still requires human approval.

Support an explicit session-owned Sales handoff even with incomplete technical
facts. It records a bounded business brief without creating a commercial order,
granting staff authorization, inventing compatibility, or contacting anyone.

Revision supersedes an unaccepted request, preserves its snapshot, decisions,
conversation and audit, and unlocks discovery in the same session. New commercial
requests revalidate all facts and need fresh approval and acceptance. Never
revise an accepted/payment-in-progress order; this MVP has no refund workflow.
Old workflow-1 records cannot enter workflow-2 payment or approval paths.

Payback is initial hardware divided by annual benefit minus recurring annual
service. Nonpositive annual net benefit has no finite payback. Preserve the
first-year net calculation separately and disclose exclusions.

## Alternatives and consequences

- Keeping checkout first is suitable for some standardized deposits but adds
  avoidable rejection/refund complexity to this consultative case.
- Replacing snapshots on edit would destroy the approval evidence. Superseding
  immutable versions costs bounded storage but preserves the decision history.
- A real CRM and authenticated employee accounts exceed this fictional demo.
  Handoffs remain private presentation state with no actual staff notification.
- Universal business coverage is not claimed: the target is tank-monitoring
  qualification. Unknown safety evidence still blocks a commercial request.

## Verification

Test payment before acceptance, approval before proposal issuance, cross-session and
expired access, stale revision decisions/acceptances, duplicate payment events,
revision history, incomplete handoff, recurring-cost payback, and proposal access
before/after acceptance and payment. Use additive migrations and no live money.
