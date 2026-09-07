# Release Readiness

**Consultative revision in progress, September 6, 2026:** ADR-0011 changes payment ordering, revisions, incomplete Sales handoff and payback. The baseline verification below describes the prior release and is not evidence that this revision has passed. Fresh checks and owner review are required before merging the updated PR #19.

**Status, September 6, 2026:** The earlier payment-first release was verified on production at [tankfit-ai.vercel.app](https://tankfit-ai.vercel.app/) from merge commit `679c78b`. The consultative-sales revision is not deployed yet; its local checks and owner review must complete before it can replace that baseline. Social publication and the competition submission remain intentionally deferred to Davi Almeida.

Fresh local evidence for this revision is recorded in [Consultative Revision Verification](consultative-release-verification-2026-09-06.md).

## Completed implementation

- Tankroy public home, catalog and embedded TankFit AI conversation.
- Separate Customer and Sales experiences sharing one private anonymous session.
- General bounded discovery, editable presets, explicit unknowns and synthetic operating-profile validation.
- Current Postgres commerce reads, immutable solution snapshots, revision history, and row-locked state transitions.
- Proposal-first consultative lifecycle: incomplete Sales handoff, explicit approval, customer acceptance, then test Checkout; recurring service is included in payback.
- Test-only hosted Stripe Checkout, signed webhook and server reconciliation. Missing sandbox configuration fails closed.
- Session-scoped approval, audit, conversation history and approved proposal downloads.
- English documentation, agent-harness rationale and a draft competition project card.

## Verification evidence

- Unit coverage includes all three presets versus equivalent custom organizations, uncertainty, unsupported applications, provider fallback, unsafe request bodies, signed webhook validation and PDF generation.
- Three real-Postgres integration tests passed: duplicate actions, immutable scope, foreign and expired sessions, invalid payments, competing decisions, approved snapshots and private prepared-fixture provenance. They create and delete exact test-owned session UUIDs; they do not modify shared catalog rows.
- The baseline eight Playwright cases passed across desktop Chromium and a mobile Chromium viewport. The consultative revision has separate local customer, Sales-help, and public-surface checks; no real sandbox payment is claimed for those automated tests.
- Connected Chrome manually verified the latest preview across the public home/widget, catalog, Customer Experience, Sales Team Experience, Demo Hub, Portuguese discovery, AirFlame draft handoff, session audit, and app-origin console behavior.
- Two-page PDF fixtures were rendered and visually inspected, including long names and unsupported font characters. No clipping or overlap was observed. This is template verification, not proof of a real sandbox payment.
- The baseline production AirFlame journey completed Stripe sandbox Checkout before approval. That ordering is intentionally superseded by the consultative revision and must be reverified after deployment.
- The downloaded two-page proposal was rendered and visually inspected. Both pages contain the `DEMO - NOT A VALID QUOTE OR CONTRACT` watermark, synthetic terms, approval evidence, and consistent unclipped layout.
- A separate baseline production checkout was cancelled from Stripe and returned to an unchanged draft. The consultative revision keeps an accepted request unpaid on cancellation and adds revision/acceptance race coverage.
- Live production checks completed French, Chinese, and Hindi discovery. Together with the earlier same-revision protected-preview evidence for English, Spanish, Italian, German, Polish, and Portuguese, every primary evaluation language passed HTTP/schema assertions and semantic review while preserving unknown fields and technical-review status.
- The production provider audit demonstrated real fallback from unavailable Gemini and Cerebras attempts to a successful Groq response. Simulated tests cover the full Gemini → Cerebras → Groq → OpenRouter → deterministic chain.
- A fresh unauthenticated request could not access the approved proposal. Cross-origin discovery was rejected, an unsigned webhook was rejected, and the retired advisor mutation returned HTTP 410.
- Vercel reported no runtime error group in the final two-hour verification window. GitHub CI and CodeQL passed on `main`; branch protection requires the full `validate-catalog` job, which runs validation, lint, type checking, unit tests, build, and secret-free Playwright tests.
- See [the original audit](verification-2026-09-05.md), [the completion record](completion-verification-2026-09-05.md), and [the final release record](final-release-verification-2026-09-06.md).

## Baseline release gates (historical)

1. Owner-controlled Stripe test credentials and the signed production webhook are configured. Successful and cancelled hosted Checkout paths were verified; failure and tampering paths pass automated tests.
2. Live multilingual quality and provider fallback were verified across the primary evaluation languages using the same release revision.
3. Davi Almeida reviewed and merged PR #13; GitHub CI and CodeQL passed on the merge commit.
4. Production public, customer, sales, proposal, session-isolation, origin, callback, and fallback boundaries were verified for the baseline release.

The consultative revision still requires a fresh deployment verification covering proposal-before-payment ordering, customer acceptance, revision history, incomplete Sales handoff, and the updated ROI explanation.

## Final publication and submission (intentionally deferred)

After the consultative revision is merged and deployed, only the following user-owned publication steps should remain:

1. Publish the prepared [LinkedIn post](submission/linkedin-post.md) and [community post](submission/community-post.md).
2. Replace the two mandatory URL placeholders in [the project card](submission/project-card.md) with the actual post URLs.
3. Fork the official challenge repository, create branch `projeto/2026-08/davicanada`, copy the card to `desafio-vendas/projetos/davicanada/README.md`, and open the submission pull request.

There is no separate submission form in the verified instructions. A video is optional.

Sources: [official submission procedure](https://github.com/suajornadadedados/desafio-jornada/blob/main/COMO-SUBMETER.md), [challenge and reference date](https://github.com/suajornadadedados/desafio-jornada/blob/main/desafio-vendas/README.md). September 5 is the stated reference date; the repository says later and in-progress entries are accepted. Recheck official instructions before submitting.
