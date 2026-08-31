# TankFit AI

TankFit AI is a public, AI-assisted sales advisor for Tankroy Systems Inc., a fictional Canadian remote tank-monitoring company. A visitor may choose an editable sample scenario or describe an independent custom fictional situation. The application identifies compatible fictional products, explains a deterministic ROI estimate, creates a draft order, completes a simulated checkout, passes through a human approval gate, and produces a clearly marked demo proposal.

This is an independent personal project by **Davi Almeida**, created with exclusively synthetic information for the **Jornada de Dados** competition. Every company, person, product, specification, price, inventory value, transaction, and document represented here is fictional.

## Current Status

The release candidate includes a responsive Next.js interface, a browsable 13-product catalog, product detail pages, an interactive compatibility laboratory, multilingual AI explanations with sequential provider fallback, and the complete AirFlame journey. A public visitor can turn a natural-language brief into confirmed requirements, receive a deterministic recommendation and ROI estimate, create a database-backed order, complete a fictional checkout, enter session-scoped Demo Staff Mode, approve the order, and download a watermarked proposal.

## Run Locally

Requirements: Node.js 22 or newer.

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The catalog and compatibility laboratory do not require database or AI credentials. The complete AirFlame journey requires `DATABASE_URL` and `SESSION_SIGNING_SECRET`; AI keys are optional because discovery and advisor explanations have deterministic fallbacks. To run every repository check:

```bash
npm run check
```

## First End-to-End Scenario

The initial implementation focuses on AirFlame Fuels, a fictional heating-oil distributor evaluating a five-tank monitoring pilot across a larger rural fleet. See [`docs/specs/airflame-pilot.md`](docs/specs/airflame-pilot.md).

AirFlame, AgricuFlow, and Boreal Beverage are optional presets and repeatable tests. They do not restrict the application to three customers; custom fictional scenarios pass through the same discovery and deterministic rules.

## Documentation

- [Product Requirements Document](docs/prd.md)
- [Architecture](docs/architecture.md)
- [AirFlame Pilot SPEC](docs/specs/airflame-pilot.md)
- [Architecture Decision Records](docs/adrs)
- [Engineering Process](docs/engineering-process.md)
- [Security Threat Model](docs/security-threat-model.md)
- [Security Policy](SECURITY.md)
- [Release Readiness](docs/release-readiness.md)
- [Product Image Prompts](docs/product-image-prompts.md)
- [Company Logo Prompts](docs/company-logo-prompts.md)
- [Asset Provenance](docs/asset-provenance.md)
- [Agent Harness](AGENTS.md)

## Catalog

- `data/catalog/products.json` contains descriptive product and compatibility data and may be used as a read-only fallback.
- `data/catalog/demo-commerce.json` contains fictional database seed values for price, stock, availability, and delivery lead time. It must never be used to confirm a runtime transaction.
- `data/companies/companies.json` maps fictional company records to their public logo asset paths.

Validate the catalog with Node.js 22 or newer:

```bash
npm run validate
```

The validation checks catalog relationships, referenced asset existence, WebP dimensions, SVG safety, orphaned assets, and prohibited runtime capabilities.

## Environment Variables

Copy [`.env.example`](.env.example) to `.env.local` and place local development secrets only in `.env.local`. The local file is ignored by Git and must never be committed. Secrets used by deployed Preview and Production environments will be configured in the Vercel project settings rather than stored in the repository.

Variables whose names begin with `NEXT_PUBLIC_` are exposed to the browser. AI provider keys, database credentials, and signing secrets must never use that prefix.

The linked Vercel project provisions Neon variables for Production, Preview, and Development. Local Vercel-managed database values are pulled into `.env.development.local`, while manually managed AI-provider keys and the session-signing secret remain in `.env.local`. Both files are ignored by Git. Vercel sensitive variables are write-only and are not restored by `vercel env pull`; pulling directly into `.env.local` replaces that file, so back up or re-enter local-only secrets afterward.

The conversational advisor tries Gemini, Cerebras, Groq, and OpenRouter in that order. Model IDs and routing limits have committed non-secret defaults in `.env.example`; real keys remain server-only. If a key is missing, a provider times out, or every provider is unavailable, the application skips safely to the next provider and ultimately returns deterministic English guidance. See [ADR-0005](docs/adrs/0005-ai-provider-fallback.md).

## Application Stack

- TypeScript, React, and Next.js App Router
- Vercel Node.js runtime and deployment
- Neon Postgres with Drizzle ORM and versioned migrations for sessions, commerce, orders, approvals, audit events, proposal metadata, and shared AI usage caps
- Static product images served by Next.js
- Server-side provider routing across free-tier AI APIs with deterministic guided fallback
- In-process PDF generation from approved database state; no file-storage service is required

## Safety Boundary

The AI controls the conversation, not technical truth or irreversible actions. Deterministic code controls compatibility, catalog claims, price, stock, lead time, calculations, order state, mock payment, approval, and proposal eligibility. No real payment or legally valid document is created.

## License and Asset Note

The source code and documentation are available under the [MIT License](LICENSE). The fictional visual assets were generated with Grok 4.6 under Davi Almeida's direction and were reviewed before inclusion. See [Asset Provenance](docs/asset-provenance.md) for details and applicable usage notes.
