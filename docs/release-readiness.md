# Release Readiness

**Status:** Current production baseline is technically release-ready; the Tankroy public-experience revision is documented on `feat/tankroy-public-experience` and is not yet deployed. Competition publication and submission are intentionally pending.

## Verified Release Candidate

- Production deployment is live at [tankfit-ai.vercel.app](https://tankfit-ai.vercel.app/), aliased from `main` at the release-readiness commit `e61bf75`.
- Production environment variables are configured for Neon, the session-signing secret, and the four server-side AI providers.
- Neon migrations were applied and the 13 synthetic commerce records were seeded.
- The public routes `/`, `/catalog`, `/advisor`, and `/demo` returned HTTP 200.
- The AirFlame browser journey completed successfully: discovery, deterministic recommendation, ROI, database-backed draft order, fictional checkout, scoped Demo Staff Mode, approval, and proposal readiness.
- The proposal endpoint returned HTTP 200 from the production runtime after approval.
- Production security headers were confirmed, including CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- Repository validation passed: catalog, assets, security boundaries, lint, TypeScript, 35 tests, and production build.
- `npm audit --audit-level=high` reported zero vulnerabilities.
- GitHub CI and CodeQL checks passed before the production merge.
- Vercel production logs showed successful route and action responses with no error-level entries during verification. A provider timeout was handled by the configured AI fallback chain.

## Approved Revision Not Yet Deployed

The next release will present the same application through two surfaces:

- A public Tankroy Systems Inc. website with home, catalog, product pages, and an embedded `Ask TankFit AI` entry point.
- The explicitly labeled `/demo` sales-workspace demonstration for requirements review, simulated checkout, Demo Staff Mode, approval, audit, and proposal generation.

The surfaces share one deployment, database, catalog, agent, deterministic domain pipeline, and security boundary. The implementation must pass the route, accessibility, session-isolation, and public-control exposure checks in [`specs/tankroy-public-experience.md`](specs/tankroy-public-experience.md) before this revision can be called release-ready.

## Final Owner Actions Before Competition Submission

These actions are deliberately left for Davi Almeida:

1. Run one final public/incognito smoke test on the production URL.
2. Capture the final screenshots and record the optional demonstration video.
3. Decide whether to publish the repository and demo URL as the competition entry materials.
4. Complete the Jornada de Dados submission form and any required competition fields.

The application, catalog, companies, transactions, AI responses, and proposal remain fictional and synthetic. No real purchase, payment, customer record, or legally valid quote is created.
