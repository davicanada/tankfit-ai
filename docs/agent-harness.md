# Coding-Agent Harness

**Owner:** Davi Almeida

The project uses OpenAI Codex as its coding-agent harness. Codex was selected for its shared-workspace editing, terminal-based validation, Git/PR workflow, and ability to inspect the running web experience. It assists implementation; it does not own product decisions or replace review.

`AGENTS.md` supplies the synthetic-data policy, deterministic authority rule, architecture boundaries, security requirements, and owner-review gate. Product intent lives in `docs/prd.md`; executable behavior is specified under `docs/specs/`; architectural trade-offs live under `docs/adrs/`.

## Repository map

- `src/app`: routes, Server Actions, integration callbacks and downloads.
- `src/components`: shared customer and sales presentation components.
- `src/domain`: deterministic compatibility, requirements, ROI and state rules.
- `src/lib`: server-only providers, sessions, transactions and PDF generation.
- `src/db` and `drizzle`: relational schema and migrations.
- `data`: exclusively fictional catalogs, company registry and evaluation fixtures.
- Adjacent `*.test.ts`: unit regression coverage.
- `integration`: isolated database-backed transaction tests.
- `e2e`: versioned Playwright browser and HTTP-boundary tests.

## Automation and deliberate limits

`npm run check` validates data/assets/security boundaries, lint, TypeScript, unit tests and production build. Playwright checks the public desktop/mobile boundaries. Postgres integration tests create temporary UUID-scoped synthetic sessions and delete only those exact sessions afterward. CI runs the repository checks and public browser suite.

Skills used during development guide Next.js boundaries, PostgreSQL transaction design, Stripe test-only integration, React review, and browser verification. They do not grant runtime capabilities to the product's conversational model.

Codex cannot authorize its own merge, competition submission, social publication, real payment, or use of private organizational data. Davi reviews generated diffs before merge. The application model cannot approve orders, decide payment outcomes, modify commerce, or execute arbitrary commands. No production security certification is implied by passing tests.
