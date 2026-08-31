# ADR-0007: Present TankFit AI Through Public and Internal Surfaces

**Status:** Accepted  
**Date:** August 31, 2026  
**Owner:** Davi Almeida

## Context

TankFit AI currently presents the competition journey as a product demonstration. A real prospective customer, however, would first visit the fictional Tankroy Systems Inc. website to understand the company and its products. An employee would use a different view to review requirements, orders, approvals, and proposals.

Showing both audiences the same unstructured entry point weakens the product narrative and makes the customer experience feel like an internal laboratory. Splitting the project into separate applications would create duplicated catalog contracts, duplicated security boundaries, separate deployments, and more failure modes for a one-person portfolio project.

## Decision

Use two clearly separated experience surfaces inside the same Next.js application and deployment:

1. **Public Tankroy website:** the customer-facing home page, use-case content, catalog, product details, and an embedded TankFit AI assistant. It is safe for anonymous visitors and contains no staff controls or cross-session data.
2. **Internal sales workspace:** the review, approval, audit, order, and proposal experience. In the public competition MVP this remains a deliberately labeled, session-scoped Sales Team Experience. A real deployment would protect the equivalent staff route with separately authenticated identities and authorization.

Add a competition-only Demo Hub with two explicit choices:

- `/demo/customer` tests Customer Experience using the same public-site components, TankFit AI chatbox, catalog, session contract, and deterministic pipeline.
- `/demo/sales` tests Sales Team Experience. It may continue the evaluator's current eligible opportunity or, through an explicit validated server mutation, create a private prepared AirFlame opportunity in the evaluator's own session.

`/demo` is the selector for these perspectives. Route selection changes presentation only. It cannot create a staff token, approve an order, or weaken object authorization. Sales mutations still require the existing short-lived token scoped to the current session and order.

Both surfaces share the same versioned catalog, deterministic compatibility and ROI modules, provider router, database schema, audit events, proposal generator, security controls, and synthetic-data policy. The public widget and full-page advisor are two entry points to the same conversational capability, not separate agents.

The public website must never imply that the fictional company, products, prices, transactions, or documents are real. The internal workspace must never be reachable as a general administrative listing or expose another anonymous session.

## Alternatives Considered

### Keep TankFit AI as the only visible website

This is simpler to implement immediately, but it makes the product look like a standalone demo rather than a plausible customer-sales workflow. It also hides the natural context in which a customer would use the advisor.

### Build two independent applications

This creates a stronger deployment boundary, but duplicates UI contracts, catalog loading, session handling, tests, environment configuration, and operational monitoring. The MVP has no team or scale boundary that justifies the cost.

### Use a third-party CMS or hosted site builder for the public catalog

This could help non-developers edit marketing content, but introduces another service, credentials, content synchronization, and a new availability dependency. The catalog is synthetic, small, versioned in Git, and already has reviewed static assets, so a Next.js surface is sufficient for the competition.

## Consequences

- The public visitor sees Tankroy first and can open TankFit AI without leaving the site.
- The challenge still demonstrates the complete sales lifecycle through the explicitly labeled demo workspace.
- One deployment keeps the security and deterministic-control boundary auditable.
- The same customer session can move from the public advisor to the guided demo, but only an explicit, short-lived server-signed token can expose approval controls.
- Evaluators can test either perspective independently without requiring a second application or access to another visitor's data.
- A prepared sales fixture is created as new session-owned state, passes through normal deterministic and commercial validation, and is identified in the audit trail; it is not a shared privileged shortcut.
- The implementation needs route-aware navigation, mobile widget behavior, clear role labels, and tests that prove public pages cannot expose staff actions.
- A future authenticated staff portal, CMS, or separate service would require a new ADR and threat-model review.

## Implementation Constraints

- Keep all source code, UI copy, catalog records, and generated documents in English; the assistant may reply in the visitor's reliably identified language.
- Keep Tankroy, TankFit AI, all customer scenarios, products, prices, and documents fictional and synthetic.
- Do not add real payment, personal-data collection, arbitrary embeds, user uploads, or an unauthenticated general staff listing.
- Do not use a shared mutable demo order or create prepared opportunity state during a page read; fixture creation must be explicit, validated, auditable, and session-owned.
- Preserve deterministic authority over compatibility, product facts, commerce, ROI, payment simulation, approval, and proposal eligibility.
