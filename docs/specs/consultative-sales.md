# SPEC: Consultative Sales Lifecycle

**Owner:** Davi Almeida
**Status:** Implementation and verification in progress

This revision supersedes the payment-first sequence in the original AirFlame
SPEC, ADR-0008 and historical verification records. All information is synthetic.

## Journey

1. Browse and ask questions. Discovery adapts to the visitor's knowledge, accepts
   volunteered groups of facts, explains technical terms and retains unknowns.
2. Review/edit technical facts and an optional bounded business brief: objective,
   target timeline, and pilot success criteria. No real identity or contact data.
3. Explicitly send the opportunity to the session's Sales demonstration even
   with incomplete facts. Show missing evidence and a next action. Do not create
   a product request or grant an approval token for an incomplete opportunity.
4. Confirm a compatible configuration and current database commerce. Create a
   frozen pilot request in `pending_approval`, with workflow version 2 and a
   monotonically increasing revision. The internal table retains its order name.
5. Enter scoped Demo Staff Mode, review the request, and approve, request changes,
   or reject with a nonempty decision note. Approval revalidates current commerce.
6. Approval creates private proposal eligibility. The customer can download and
   review it before selecting `Accept proposal`. Acceptance references the exact
   approved revision and revalidates commerce and proposal expiry.
7. Acceptance records `accepted` and enables Stripe test Checkout for the stored
   CAD 250 simulated deposit. A signed callback or server reconciliation verifies
   the exact test Checkout ID, amount and currency and records `paid` once.
8. Show completion and the approved proposal, plus a proposed pilot evaluation
   checklist. No real fulfillment, alerts, notifications or telemetry is implied.

## Revisions

`pending_approval`, `changes_requested`, `rejected` and unpaid `approved` requests
can be explicitly superseded. Keep snapshots, notes, messages and audit; unlock
requirements and invalidate former proposal eligibility. The next submitted
request receives a new ID and revision and needs fresh staff approval. Accepted
and paid requests cannot be revised. Bound requests to ten revisions per session.
Tokens for old request IDs cannot authorize decisions on a new revision.

Legacy workflow-1 records remain historical and cannot pay, accept, or approve
through the new lifecycle. The UI identifies these and offers a fresh demo.

## Financial model

For a hypothetical fleet rollout: initial hardware = units × unit price;
annual service = units × monthly service × 12; annual net benefit = gross annual
avoided costs − annual service. Simple payback in months is initial hardware /
annual net benefit × 12 only when the denominator is positive. Otherwise show
`Not reached under these assumptions`. First-year net = annual benefit minus
hardware and first-year service. No installation, tax, freight, maintenance,
financing, discounting or unlisted costs are included. This is illustrative.

The default 500-unit AirFlame model has CAD 23,928 annual benefit, CAD 24,000
annual service and CAD -72 annual net benefit: no finite payback. Do not modify
assumptions to manufacture a positive result.

## Pilot evaluation

Use the five-unit pilot to evaluate readings, alert usefulness and manual-check
effort before deciding whether to expand, adjust or stop. Customer-entered
success criteria are hypotheses, not measured results or product guarantees.

## Acceptance coverage

- Incomplete handoff retains unknown facts and creates no commercial request.
- Equivalent custom and preset facts receive identical compatibility outcomes.
- No checkout before approved-proposal acceptance, including direct action calls.
- Proposals are private and approved before payment; superseded links fail closed.
- Concurrent decisions, acceptance versus revision, and duplicate callbacks are
  serialized with the existing session-row lock.
- Revisions preserve old snapshots and require a new decision and acceptance.
- Payment references cannot be reused across revisions or anonymous sessions.
- Guided discovery remains available on AI failure; commerce fails closed on
  database failure. No live provider fallback for unavailable Stripe sandbox.
