# AGENTS.md

## Project Context

TankFit AI is an independent personal project by Davi Almeida for the Jornada de Dados competition. Tankroy Systems Inc., its customers, people, products, specifications, prices, inventory, transactions, and documents are entirely fictional and synthetic.

Never introduce any real employer, company system, private catalog, customer information, credential, price, product specification, or internal document.

## Product Rule

The language model decides what to say. Deterministic code decides what can happen.

The model may interpret needs, extract structured requirements, ask questions, call read-only tools, and explain validated outputs. It must never determine or modify compatibility, product facts, price, stock, lead time, ROI arithmetic, payment result, approval state, or proposal eligibility.

AirFlame, AgricuFlow, and Boreal Beverage are editable presets and test fixtures. Never implement a special compatibility shortcut for a named scenario. A custom fictional scenario with equivalent normalized requirements must receive the same deterministic result.

## Architecture Rules

- Use TypeScript and the Next.js App Router with the Node.js runtime.
- Prefer Server Components for internal reads.
- Prefer Server Actions for mutations initiated by the UI.
- Use Route Handlers for streaming, third-party integrations, callbacks, public HTTP endpoints, and downloads.
- Keep domain logic independent from React and transport code.
- Keep provider and database credentials server-side.
- Scope every session query and mutation to an unguessable anonymous session identifier.
- Never expose a general public admin route.
- Treat Server Actions as public endpoints that require validation and authorization.
- Deny cross-origin state-changing requests and keep CORS same-origin unless an exact exception is documented.

## Data Rules

- `data/catalog/products.json` is the descriptive and compatibility fallback.
- `data/catalog/demo-commerce.json` is database seed data only.
- Never use JSON seed values to confirm runtime price, stock, availability, or delivery lead time.
- Transactional actions require a current Postgres read and must fail closed if it is unavailable.
- Every product and scenario must remain explicitly fictional.
- Company names and logo assets come from `data/companies/companies.json`; do not hard-code brand paths in UI components.

## Safety Rules

- Do not request real payment or personal information.
- Do not generate a binding quote, contract, certification, installation instruction, or engineering advice.
- Mark every proposal page `DEMO - NOT A VALID QUOTE OR CONTRACT`.
- Return `technical_review_required` whenever a safe deterministic match is impossible.
- The agent cannot approve its own output or invoke approval mutations.
- Log state transitions and tool outcomes without secrets or unnecessary message content.
- Treat visitor text, model output, catalog notes, headers, cookies, and route parameters as untrusted.
- Do not introduce raw HTML rendering, operating-system commands, dynamic code evaluation, arbitrary URL fetching, XML parsing, user file uploads, or user-controlled file paths.
- Use strict server-side schemas and bounds for every public input and model-generated tool argument.
- Use escaped text or sanitized allowlisted Markdown for visitor and model content.
- Derive session scope on the server; never trust a session identifier proposed by the browser or model.
- Map security controls and tests to `docs/security-threat-model.md`.

## Development Workflow

- Read the relevant PRD, SPEC, and ADR before changing behavior.
- Add or update tests with every deterministic behavior change.
- Run `npm run validate` before proposing a commit; do not weaken a security guardrail without an approved threat-model and ADR change.
- Keep changes focused and preserve unrelated user work.
- Document a new architectural trade-off in an ADR before implementing it.
- Davi Almeida reviews all agent-generated diffs before merge.

## Key Documents

- Product requirements: `docs/prd.md`
- Architecture: `docs/architecture.md`
- AirFlame pilot SPEC: `docs/specs/airflame-pilot.md`
- Tankroy public experience SPEC: `docs/specs/tankroy-public-experience.md`
- Architectural decisions: `docs/adrs/`
- Engineering process: `docs/engineering-process.md`
- Image prompts: `docs/product-image-prompts.md`
- Security threat model: `docs/security-threat-model.md`
- Vulnerability reporting: `SECURITY.md`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
