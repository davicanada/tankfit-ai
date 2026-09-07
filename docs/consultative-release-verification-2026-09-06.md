# Consultative Revision Verification — September 6, 2026

This record covers the proposal-first consultative-sales revision on
`codex/full-workflow-simulation`. It is local/preview evidence only; it does
not claim a production deployment, a live provider-quality certification, or a
real payment.

## Executed gates

- `npm run check`: passed catalog, asset, and security-boundary validators;
  ESLint; TypeScript; 88 unit tests; and the optimized Next.js build.
- `npm run db:migrate`: passed against the configured Neon database, applying
  migrations `0004_consultative_sales` and `0005_consultative_statuses`.
- `npm run test:integration`: 7 Postgres tests passed. Coverage includes
  proposal-before-payment ordering, exact customer acceptance, duplicate
  payment callbacks, immutable snapshots, revision history, incomplete Sales
  handoff, acceptance-versus-revision races, stale commerce, private fixture
  provenance, legacy-record denial, expiry, and cross-session isolation.
- `E2E_DATABASE=1 npm run test:e2e`: 12 desktop/mobile Chromium tests passed;
  20 opt-in live-provider cases were skipped. The passing cases cover the
  complete AirFlame request → Sales approval → proposal → customer acceptance
  sequence, novice incomplete-fact handoff, public catalog/widget boundaries,
  Demo Hub separation, session locking, origin checks, and unsigned callback
  rejection.

## Verified behavior

1. An incomplete visitor brief can be saved for the current session's Sales
   review without creating an order, requesting payment, or granting staff
   authorization.
2. A compatible request is revalidated against current Postgres commerce and
   frozen as workflow version 2 in `pending_approval` with a revision number.
3. Staff approval is explicit, scoped and note-bearing. It creates a private,
   watermarked proposal; it does not start Checkout.
4. Customer acceptance is a separate server transition. Only the accepted
   revision can attach a Stripe test Checkout session.
5. Payment verification requires the stored Checkout ID, expected amount and
   currency, test mode, and a paid provider result. Duplicate callbacks are
   idempotent and cannot approve an order.
6. Unaccepted requests can be superseded into a new revision while preserving
   prior snapshots, decisions, conversation and audit events. Accepted or paid
   requests cannot be revised.
7. The ROI view includes recurring annual service in net-benefit payback and
   states `Not reached under these assumptions` when net benefit is nonpositive.

## Remaining release gates

- Owner review and merge of the pull request.
- Fresh Vercel deployment verification using the revised ordering and current
  environment variables.
- Optional live-language/provider-quality review and an owner-controlled Stripe
  sandbox run after deployment.
- Social publication, project-card URL insertion, and the official challenge
  pull request.
