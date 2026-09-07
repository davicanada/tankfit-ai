# Final Release Verification — September 6, 2026

> Historical baseline record. The September 6 consultative-sales revision supersedes the payment-first ordering documented below; this file is retained for audit history and is not current-release evidence.

This record documents the final technical verification performed before social publication and competition submission. It does not itself publish or submit the project.

## Verified release

- Repository: `https://github.com/davicanada/tankfit-ai`
- Production: `https://tankfit-ai.vercel.app/`
- Git revision: merge commit `679c78b60e8575e5e012625f9c44564a32fb94cf`
- Vercel deployment: `dpl_7CqBZ8nzYYjprJs6nDx3wTSzVK3M`, state `READY`
- Repository visibility and license: public, MIT
- GitHub release checks: CI and CodeQL passed on `main`

All organizations, products, people, prices, stock values, transactions, and documents used in this verification were fictional and synthetic.

## Local engineering gates

- `npm run check`: passed catalog, asset, and security-boundary validators; ESLint; TypeScript; 74 unit tests in 12 files; and the optimized Next.js build.
- `npm run test:integration`: 3 Postgres integration tests passed, covering serialized mutations, immutable solution snapshots, session isolation, expiry, approval eligibility, proposal privacy, and prepared-fixture provenance.
- `E2E_DATABASE=1 npm run test:e2e`: 8 applicable desktop/mobile Playwright tests passed. The 18 live-provider permutations remained opt-in by design.
- `npm audit --audit-level=high`: zero known vulnerabilities reported.

The first local database browser run failed safely because its process did not contain a non-empty `SESSION_SIGNING_SECRET`. The run was repeated with an ephemeral 32-byte local signing secret and passed. Production signing configuration was unaffected.

## Production customer-to-sales journey

The AirFlame preset was completed in the deployed application through the same public controls available to an evaluator:

1. The visitor confirmed the structured fictional requirements.
2. Deterministic rules selected FloatLink FL-100 and exposed matching evidence.
3. Current Postgres commerce values were re-read before creating the five-unit draft.
4. Stripe-hosted Checkout ran in sandbox mode for a CAD 250.00 fictional deposit using Stripe test data.
5. The signed webhook recorded `test_payment_verified` with `realMoneyMoved: false` and moved the order to `pending_approval`.
6. Sales Team Experience showed only the same anonymous session's opportunity and audit history.
7. The evaluator explicitly entered short-lived, order-scoped Demo Staff Mode and approved the fictional pilot with a review note.
8. The approved status and proposal download became visible in both Sales Team Experience and Customer Experience.

The recorded order prefix was `d78da330`. Its audit sequence was `session_started` → `requirements_confirmed` → `draft_order_created` → `test_checkout_started` → `test_payment_verified` → `order_submitted_for_approval` → `demo_staff_mode_entered` → `proposal_ready` → `order_approved`.

## Proposal verification

The production proposal was downloaded through the session-scoped route and inspected as both extracted text and rendered images.

- PDF metadata identifies Davi Almeida as author and TankFit AI as creator.
- The document contains two US Letter pages and no form, JavaScript, encryption, or embedded runtime capability.
- Both pages visibly contain `DEMO - NOT A VALID QUOTE OR CONTRACT` as a diagonal watermark.
- Page 1 contains the fictional customer, product, quantity, commercial values, lead time, confirmed application, human approval note, and catalog/rule/commerce versions.
- Page 2 contains transparent ROI assumptions, deterministic outputs, and explicit synthetic/demo terms.
- No clipping, overlap, broken glyphs, or unreadable content was observed in the rendered pages.
- A request without the matching anonymous session received HTTP 404 for the same opaque proposal URL.

## Failure and security boundaries

- Cancelling a separate Stripe sandbox Checkout returned to Customer Experience with the order still in `Draft`; no approval control or proposal appeared.
- Automated Stripe and journey tests cover unpaid, live-mode, replayed, unsigned, wrong-amount, foreign-session, expired-session, and competing-decision cases.
- An unsigned production webhook request returned HTTP 400.
- A cross-origin discovery mutation returned HTTP 403.
- The retired `/api/advisor` POST returned HTTP 410.
- Browser console inspection after the approved journey showed no application error or warning.
- Vercel reported no runtime error group during the final two-hour verification window. Observed 400, 403, 404, 405, and 410 responses were the deliberate negative checks above.

## Live AI and fallback evidence

Production live-provider tests passed French, Chinese, and Hindi discovery. Their responses stayed in the visitor's language, retained unconfirmed fields as unknown, and required technical review before a recommendation could become actionable.

The production audit showed Gemini rate limiting and Cerebras billing unavailability followed by a successful Groq response, demonstrating real failover. Earlier protected-preview verification on the same release tree covered English, Spanish, Italian, German, Polish, and Portuguese. Unit tests cover all provider outcomes, circuit breaking, OpenRouter fallback, and the final deterministic response.

## Submission boundary

The implementation, deployment, evidence, documentation, public repository, and draft project card are ready. The only remaining activities are publishing the two required social/community posts, inserting their URLs in the project card, and opening the official challenge pull request. The optional video has not been created.
