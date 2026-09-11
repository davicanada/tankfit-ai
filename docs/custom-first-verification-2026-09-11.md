# Custom-First Revision Verification

**Date:** September 11, 2026  
**Scope:** Public custom-scenario entry, Sales empty state, and session-safe
customer-to-Sales journey  
**Status:** Local verification complete; hosted deployment and owner review
pending

## Product checks

- The home page presents a neutral custom discovery workspace with no preloaded
  customer, recommendation, logo or named scenario.
- Customer Experience and `/advisor` begin with unknown technical facts and
  accept a visitor-described fictional operation.
- Sales Team Experience shows `No opportunity in this session` until the same
  anonymous session explicitly creates an opportunity through Customer
  Experience.
- The public code has no prepared-fixture Server Action or named scenario
  control. Named records remain isolated regression fixtures only.
- A stale asynchronous initialization response cannot overwrite a newer reset,
  edit or confirmation. The client ignores out-of-order journey responses.

## Automated evidence

| Check | Result |
| --- | --- |
| `npm run validate` | Passed: catalog, assets and security boundaries |
| `npm run typecheck` | Passed |
| `npm run test` | Passed: 92 unit tests |
| `npm run test:integration` | Passed: 7 PostgreSQL lifecycle tests |
| `npm run build` | Passed: Next.js production build |
| `e2e/public-experience.spec.ts` | Passed: 10 tests across desktop and mobile Chromium |
| `e2e/customer-journey.spec.ts` | Passed: 6 tests across desktop and mobile Chromium |

The browser suites ran against a fresh local Next.js server and a configured
isolated Neon database. Because the local `.env.local` intentionally does not
contain a usable signing secret, the E2E run supplied a process-only random
secret; no credential was written to the repository or printed.

The E2E coverage includes the custom compatible path, written pilot quantity
extraction, incomplete Sales handoff, Sales empty state, revision history,
session-scoped proposal access, proposal-before-payment ordering, and the
desktop/mobile chat-lock regression.

## Release boundary

This verification does not claim that the new branch is deployed to the public
Vercel URL. Davi Almeida must review the diff, merge the pull request, verify
the resulting deployment, then complete the social publication and official
competition submission steps documented in `docs/release-readiness.md`.
