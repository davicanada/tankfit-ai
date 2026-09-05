# ADR-0008: Complete discovery, transactional snapshots, and test payments

**Status:** Accepted for implementation; owner review required before merge

**Date:** September 5, 2026
**Owner:** Davi Almeida

## Decision

Replace AirFlame-only transactional literals with one bounded requirements schema shared by presets and custom discovery. A new brief replaces extracted technical facts rather than inheriting unmentioned preset facts. Unknown fields stay unknown and block consequential actions. Canonical structured controls remain the deterministic fallback.

Only versioned, explicitly synthetic operating profiles may validate temperature and reporting requirements. Missing catalog evidence requires technical review. Extra installation, pressure, material-contact, or cylinder constraints remain review gates rather than implied certifications.

Use short Postgres transactions with a session-row lock for requirement confirmation, order creation, checkout, and approval. Freeze an order's solution snapshot (requirements, ROI, product facts, and rule/catalog versions) when creating it. Later document generation uses that snapshot, not mutable session or current catalog data. Existing orders without a snapshot cannot issue a new document; the visitor starts a fresh demo. Reset removes only the caller's session and cascaded synthetic records.

Keep HTTP reads and add the Neon WebSocket transaction driver for interactive database transactions. Do not hold a transaction open while calling AI or a payment provider. Revalidate commercial data at transaction boundaries, including lead time, currency, and commerce version. Duplicate actions are idempotent or rejected without duplicate state transitions.

Use Stripe-hosted Checkout in test mode for the competition payment path. Reject live credentials and live objects. Only a verified paid test Checkout Session with the expected stored ID, amount, currency, and order metadata can advance an order. A signed webhook or an explicit server-side reconciliation may confirm payment; a browser redirect is never proof. The existing internal mock remains explicitly labeled development coverage, never an automatic substitute for an unavailable sandbox.

## Alternatives and consequences

- Keeping AirFlame defaults during extraction is convenient but silently creates unsupported requirements; explicit unknowns add questions but preserve correctness.
- Independent reads and conditional updates are inexpensive but insufficient for related state and event consistency. Short row-locked transactions serialize one anonymous session without a global lock.
- Rendering from current catalog/session state can change approved documents; frozen snapshots cost a small amount of short-lived JSON storage.
- Embedded card forms increase client attack surface and can invite real details. Hosted test Checkout isolates payment entry and allows the app to store only opaque payment references. Test-account credentials and endpoint configuration are deployment dependencies; no paid upgrade is authorized.
- A mock-only deposit demonstrates a state machine but does not demonstrate a processor test integration. Sandbox failure must remain visible.

## Verification obligations

The old stateless `/api/advisor` endpoint is retired (HTTP 410). Live conversations use only session-scoped `/api/discovery` and full operating-profile validation. Transactional recommendations omit alternatives validated only by base rules. The model receives validated evidence and no mutation tools; explicit UI actions own transactional changes.

Unknown/negated/unsupported discovery, unit conversion, snapshot immutability, expired/foreign sessions, concurrent duplicate actions, changed commerce, forged webhooks, live-mode rejection, payment amount mismatch, and proposal gating require regression coverage. All new UI and documents remain English and explicitly fictional. No submission or owner-review bypass is authorized by this ADR.
