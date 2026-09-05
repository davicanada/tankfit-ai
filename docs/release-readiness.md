# Release Readiness

**Status, September 5, 2026:** Completion revision implemented on `codex/competition-completion` and verified on the latest protected preview. Not yet certified for submission. The old production baseline does not demonstrate the new Stripe test integration or the full revised public experience.

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
- See [the original audit](verification-2026-09-05.md) for historical findings and [the completion record](completion-verification-2026-09-05.md) for current command results.

## Release gates still requiring evidence

1. Configure owner-controlled Stripe **test** credentials and webhook in the target environment; verify successful, cancelled and declined Checkout plus signed callback/reconciliation and the final browser approval/download path. See [setup](stripe-test-setup.md).
2. Verify live conversational quality in the evaluation languages and provider failures on the new deployment. Local AI keys are not configured; simulated provider tests do not prove live multilingual quality.
3. Davi Almeida reviews the PR diff; required CI/CodeQL checks pass; only then merge and verify production. No automatic owner-review bypass.
4. Run a fresh incognito test of the deployed release, including one complete test-payment journey and one unsupported scenario.

Do not report that only submission remains while these gates are open.

## Final publication and submission (intentionally deferred)

After release approval, publish the actual LinkedIn and platform/community posts and replace both URL placeholders in [the project card](submission/project-card.md). Fork the official challenge repository, copy the card to `desafio-vendas/projetos/davicanada/README.md`, and open the submission PR. There is no separate submission form in the verified instructions. The video is optional.

Sources: [official submission procedure](https://github.com/suajornadadedados/desafio-jornada/blob/main/COMO-SUBMETER.md), [challenge and reference date](https://github.com/suajornadadedados/desafio-jornada/blob/main/desafio-vendas/README.md). September 5 is the stated reference date; the repository says later and in-progress entries are accepted. Recheck official instructions before submitting.
