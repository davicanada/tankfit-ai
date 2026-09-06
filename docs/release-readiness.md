# Release Readiness

**Status, September 6, 2026:** Submission-ready release verified on production at [tankfit-ai.vercel.app](https://tankfit-ai.vercel.app/) from merge commit `679c78b`. No product or engineering release gate remains open. Social publication and the competition submission are intentionally deferred to Davi Almeida.

## Completed implementation

- Tankroy public home, catalog and embedded TankFit AI conversation.
- Separate Customer and Sales experiences sharing one private anonymous session.
- General bounded discovery, editable presets, explicit unknowns and synthetic operating-profile validation.
- Current Postgres commerce reads, immutable solution snapshots and row-locked state transitions.
- Test-only hosted Stripe Checkout, signed webhook and server reconciliation. Missing sandbox configuration fails closed.
- Session-scoped approval, audit, conversation history and approved proposal downloads.
- English documentation, agent-harness rationale and a draft competition project card.

## Verification evidence

- Unit coverage includes all three presets versus equivalent custom organizations, uncertainty, unsupported applications, provider fallback, unsafe request bodies, signed webhook validation and PDF generation.
- Three real-Postgres integration tests passed: duplicate actions, immutable scope, foreign and expired sessions, invalid payments, competing decisions, approved snapshots and private prepared-fixture provenance. They create and delete exact test-owned session UUIDs; they do not modify shared catalog rows.
- Eight Playwright cases passed across desktop Chromium and a mobile Chromium viewport, including AirFlame confirmation, draft creation, frozen scope and Sales handoff. No real sandbox payment was performed by these tests.
- Connected Chrome manually verified the latest preview across the public home/widget, catalog, Customer Experience, Sales Team Experience, Demo Hub, Portuguese discovery, AirFlame draft handoff, session audit, and app-origin console behavior.
- Two-page PDF fixtures were rendered and visually inspected, including long names and unsupported font characters. No clipping or overlap was observed. This is template verification, not proof of a real sandbox payment.
- A production AirFlame journey completed Stripe sandbox Checkout, webhook verification, `pending_approval`, explicit session-scoped Demo Staff Mode, approval, customer-visible final status, and proposal download.
- The downloaded two-page proposal was rendered and visually inspected. Both pages contain the `DEMO - NOT A VALID QUOTE OR CONTRACT` watermark, synthetic terms, approval evidence, and consistent unclipped layout.
- A separate production checkout was cancelled from Stripe and returned to an unchanged draft. Unpaid, live-mode, replayed, unsigned, wrong-amount, foreign-session, and competing-decision paths remain covered by unit and Postgres integration tests without generating approval eligibility.
- Live production checks completed French, Chinese, and Hindi discovery. Together with the earlier same-revision protected-preview evidence for English, Spanish, Italian, German, Polish, and Portuguese, every primary evaluation language passed HTTP/schema assertions and semantic review while preserving unknown fields and technical-review status.
- The production provider audit demonstrated real fallback from unavailable Gemini and Cerebras attempts to a successful Groq response. Simulated tests cover the full Gemini → Cerebras → Groq → OpenRouter → deterministic chain.
- A fresh unauthenticated request could not access the approved proposal. Cross-origin discovery was rejected, an unsigned webhook was rejected, and the retired advisor mutation returned HTTP 410.
- Vercel reported no runtime error group in the final two-hour verification window. GitHub CI and CodeQL passed on `main`; branch protection requires the full `validate-catalog` job, which runs validation, lint, type checking, unit tests, build, and secret-free Playwright tests.
- See [the original audit](verification-2026-09-05.md), [the completion record](completion-verification-2026-09-05.md), and [the final release record](final-release-verification-2026-09-06.md).

## Closed release gates

1. Owner-controlled Stripe test credentials and the signed production webhook are configured. Successful and cancelled hosted Checkout paths were verified; failure and tampering paths pass automated tests.
2. Live multilingual quality and provider fallback were verified across the primary evaluation languages using the same release revision.
3. Davi Almeida reviewed and merged PR #13; GitHub CI and CodeQL passed on the merge commit.
4. Production public, customer, sales, proposal, session-isolation, origin, callback, and fallback boundaries were verified.

## Final publication and submission (intentionally deferred)

Only the following user-owned publication steps remain:

1. Publish the prepared [LinkedIn post](submission/linkedin-post.md) and [community post](submission/community-post.md).
2. Replace the two mandatory URL placeholders in [the project card](submission/project-card.md) with the actual post URLs.
3. Fork the official challenge repository, create branch `projeto/2026-08/davicanada`, copy the card to `desafio-vendas/projetos/davicanada/README.md`, and open the submission pull request.

There is no separate submission form in the verified instructions. A video is optional.

Sources: [official submission procedure](https://github.com/suajornadadedados/desafio-jornada/blob/main/COMO-SUBMETER.md), [challenge and reference date](https://github.com/suajornadadedados/desafio-jornada/blob/main/desafio-vendas/README.md). September 5 is the stated reference date; the repository says later and in-progress entries are accepted. Recheck official instructions before submitting.
