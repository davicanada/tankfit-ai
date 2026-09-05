# Competition Readiness Audit — 2026-09-05

## Verdict

The deployed AirFlame baseline has a working happy path. The complete approved product scope is **not finished**, and passing the current test suite does not establish full challenge compliance. Submission is not the only remaining task.

This audit qualifies the earlier baseline readiness statement in `release-readiness.md`; it does not certify the pending Tankroy experience revision or every security and failure path.

All test interactions used fictional demo data. No real payment, public submission, social post, merge, or deployment was performed during this audit.

## Official Timing and Submission

The [challenge statement](https://github.com/suajornadadedados/desafio-jornada/blob/main/desafio-vendas/README.md#datas-e-o-que-acontece-com-os-projetos) identifies September 5, 2026 as its reference date, not a final closure. It explicitly continues accepting projects afterward and welcomes incomplete projects with clear documentation. No cutoff time or timezone is specified.

The [submission guide](https://github.com/suajornadadedados/desafio-jornada/blob/main/COMO-SUBMETER.md) requires a project card submitted by pull request to the challenge repository. The card needs the public project repository and actual LinkedIn and platform-community post URLs. Video is optional. A Discussion or unspecified submission form is not the documented card-submission procedure.

## Baseline

- Local branch: `feat/tankroy-public-experience`, commit `af73bb0e4309c59c940f73b7d8b254899e84c136`.
- Production baseline: `main`, commit `e61bf7514d4f7d6dd3f6ca38dcf5595c6bbcdb2b`.
- The two subsequent branch commits change documentation, not application behavior.
- Public repository: [davicanada/tankfit-ai](https://github.com/davicanada/tankfit-ai).
- Production: [tankfit-ai.vercel.app](https://tankfit-ai.vercel.app/).

## Evidence Collected

| Check                        | Result                | Evidence and limits                                                                                                                                                                                                |
| ---------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Full local verification      | Passed                | `npm run check`: catalog, assets, security-boundary validation, lint, TypeScript, 35 tests in 9 files, and production build.                                                                                       |
| Synthetic assets             | Passed                | 13 catalog products, 13 commerce seed records, 4 companies, 13 WebP images, and 4 SVG logos passed validators. This is not a new visual review of every image.                                                     |
| Dependency audit             | Passed                | `npm audit --audit-level=high` reported zero vulnerabilities at audit time. This is not a security certification.                                                                                                  |
| GitHub process               | Passed for baseline   | Main CI and CodeQL succeeded; protected main requires a PR and the `validate-catalog` status check, with administrator enforcement.                                                                                |
| Existing production routes   | Passed                | `/`, `/catalog`, `/advisor`, and `/demo` returned HTTP 200.                                                                                                                                                        |
| New presentation routes      | Missing               | `/demo/customer` and `/demo/sales` returned HTTP 404; corresponding implementation is absent.                                                                                                                      |
| Live advisor API             | Passed, narrow sample | One Portuguese product-explanation request returned HTTP 200 in AI mode using Gemini, reporting model `gemini-3.7-flash`. This does not verify every language or live fallback provider.                           |
| AirFlame transaction journey | Passed, baseline path | Confirmed preset requirements, rendered FloatLink FL-100 recommendation and ROI, created a database-backed draft, simulated deposit, explicitly entered Demo Staff Mode, approved, and received the proposal link. |
| Proposal response            | Passed                | Session-owned fetch returned HTTP 200, `application/pdf`, 4,304 bytes, `%PDF-1.7`, and `private, no-store, max-age=0`.                                                                                             |
| Anonymous proposal access    | Denied as expected    | Fetching the same proposal without the owning session returned HTTP 404. This is one isolation check, not an exhaustive two-session test suite.                                                                    |
| Browser errors               | None recorded         | No browser errors were reported for the completed smoke path.                                                                                                                                                      |

Browser actions were exercised in an isolated automation session using DOM button activation and subsequent UI snapshots. Physical pointer/keyboard interaction, mobile layout, and accessibility were not fully validated. The discovery button was not established as part of the completed transaction smoke; the live advisor API was tested separately. The generated PDF was checked at the HTTP/binary boundary, not visually inspected page by page.

## Remaining Work

### 1. Complete safe conversational discovery

The generic compatibility advisor and the transactional journey are not yet one general customer workflow. `src/domain/journey/types.ts` restricts the transactional schema to AirFlame-style material, tank, gauge, and connectivity literals. Editable company names do not make that workflow support arbitrary scenarios.

`src/lib/ai/discovery.ts` merges non-null extraction fields into the existing requirements. Missing or unsupported information can retain preset values instead of becoming unresolved. Its deterministic temperature parser recognizes both C and F but does not convert Fahrenheit; keyword matching also needs explicit negation tests.

`src/lib/journey-service.ts` passes neither temperature, reading frequency, nor low-level alert requirements into compatibility evaluation, despite collecting those fields. Define and test the supported guarantees, and route requirements that cannot be safely validated to technical review.

Acceptance: unknown, contradictory, unsupported, and custom fictional briefs must not inherit a convenient match; equivalent normalized requirements must yield the same result regardless of company name.

### 2. Use a payment provider's test environment

The current deposit is an internal simulation, not a payment-provider sandbox. The challenge explicitly asks participants to use payment-method test environments. Stripe test mode is one option, not a mandated vendor.

Acceptance: server-validated test checkout and verified callback/webhook processing, with idempotency, failed/cancelled payment cases, and no live-money path. This requires an integration decision and its security documentation before implementation.

### 3. Expose reviewable history and AI usage information

Events are written, but the current journey does not expose a session-scoped history/timeline for reviewing what happened. AI request caps exist, but token/cost reporting is not implemented by the current provider router. These are partial implementations of the client's observability and cost-control wishes.

Acceptance: a privacy-conscious, session-owned event history and explicit usage/cost reporting, including an honest unknown/unavailable state rather than fabricated cost figures.

### 4. Implement the approved customer and sales experiences

The Tankroy public website, embedded advisor, Demo Hub, Customer Experience, and Sales Team Experience are specified but not implemented. These presentation choices are our approved product scope, not prescribed routes in the challenge.

Acceptance: the criteria in `specs/tankroy-public-experience.md`, including explicit private fixture creation, provenance, normal validation, and no authorization granted by mode selection.

### 5. Close the regression and release-evidence gaps

No versioned Playwright E2E suite is present. The 35 existing tests are not proof of full database-backed session isolation, concurrent state transitions, payment callbacks, every language, all live providers, or security attack resistance.

Add repeatable happy-path and negative-path coverage. In particular, review the mutable session data used by proposal generation: confirmation currently updates session requirements without an order-state guard, while the PDF combines those session fields with the order snapshot. Prevent an approved document from silently mixing different revisions. This is a source-review finding, not a production exploit attempted during the audit.

Acceptance: persistent integration/E2E tests for approval bypass, foreign/expired sessions, database failure, changed commerce, duplicate actions, proposal snapshot integrity, provider exhaustion, and the supported language matrix. Inspect every PDF page for the required demo notice. Playwright itself is our recommended implementation tool, not a named competition requirement.

### 6. Align engineering and submission documentation

Explicitly name the chosen coding-agent harness and explain why it was selected; `AGENTS.md` and review rules are present, but the harness rationale is not explicit in the reviewed documentation. Update readiness wording and submission instructions to match the verified scope and official PR-card process.

## Recommended Completion Order

1. Correct discovery/compatibility and immutable proposal-state risks with regression tests.
2. Add sandbox payment and reviewable session history/usage evidence.
3. Implement the already-approved customer and sales surfaces.
4. Run the versioned integration/E2E suite, live-provider smoke checks, and final production verification after owner-reviewed merge.
5. Prepare accurate screenshots and the project card; publish the required posts and submit only when Davi Almeida authorizes those external actions.

Submitting the current project honestly as work in progress is permitted by the official guide. Describing it as implementing and verifying every approved requirement is not supported by this audit.
