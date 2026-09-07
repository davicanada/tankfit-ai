# Community Post Draft

## TankFit AI — an end-to-end fictional sales agent

I created TankFit AI for the Jornada de Dados challenge. The case is Tankroy Systems Inc., an entirely fictional remote tank-monitoring company whose customers usually understand their operational problem but do not know which monitoring product fits it.

The public experience combines a fictional company website and catalog with an embedded advisor. An evaluator can complete the same private opportunity through Customer Experience and Sales Team Experience: discovery or incomplete-fact handoff, deterministic compatibility, editable ROI assumptions, a validated pilot request, explicit human approval, a two-page demo proposal, customer acceptance, and Stripe test Checkout. Revisions preserve prior evidence and decisions in the audit history.

My most important design decision was to separate conversation from authority. The AI can interpret needs, ask questions, and explain validated evidence. Deterministic TypeScript and Postgres transactions control compatibility, product facts, price, stock, lead time, calculations, payment state, approval, and proposal eligibility.

I also implemented a Gemini → Cerebras → Groq → OpenRouter → deterministic fallback chain, shared request caps, session isolation, signed webhooks, immutable solution snapshots, CI, CodeQL, unit/integration tests, and Playwright desktop/mobile checks.

Everything represented by the application is fictional and synthetic. No real organization, customer data, payment, product catalog, or legally valid document is involved.

- Demo: https://tankfit-ai.vercel.app/
- Repository: https://github.com/davicanada/tankfit-ai

The repository includes the PRD, SPECs, ADRs, architecture, threat model, agent-harness rules, test evidence, and submission card.

After publishing, copy the resulting community-post URL into `docs/submission/project-card.md`.
