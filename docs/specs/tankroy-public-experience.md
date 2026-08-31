# SPEC: Tankroy Public Experience and Sales Workspace

**Status:** Approved for implementation  
**Version:** 0.1  
**Date:** August 31, 2026  
**Owner:** Davi Almeida  
**Related ADR:** [`0007-public-customer-and-sales-surfaces.md`](../adrs/0007-public-customer-and-sales-surfaces.md)

## 1. Purpose

This SPEC defines how TankFit AI is presented as part of the fictional Tankroy Systems Inc. website while preserving the existing end-to-end competition demonstration. The change is a product-surface reorganization, not a second application or a second agent.

All companies, people, products, specifications, prices, inventory, transactions, and documents remain fictional and synthetic. This is an independent personal project by Davi Almeida created exclusively for the Jornada de Dados competition.

## 2. Experience Model

### 2.1 Public customer surface

The public surface represents the fictional Tankroy website:

- Home page explaining Tankroy's fictional monitoring solutions and use cases.
- Use-case and category content grounded in the versioned catalog.
- Product catalog and product-detail pages with reviewed synthetic images and compatibility attributes.
- A visible `Ask TankFit AI` call to action and a floating assistant on relevant public pages.
- A full-page `/advisor` route as an accessible fallback for visitors who do not use the widget or need a larger conversation view.
- Fictional-data and independent-project notices visible without requiring a conversation.

The widget is a compact entry point. It may collect a free-text operational brief, ask discovery questions, show a grounded recommendation, and link the visitor to the full journey. It must not expose staff actions, arbitrary catalog mutation, provider credentials, or another session's order.

### 2.2 Internal and demonstration surface

The sales workspace represents a Tankroy solution specialist reviewing a synthetic opportunity:

- Structured requirements and the original customer brief.
- Deterministic recommendation, matched fields, unresolved constraints, catalog/rule versions, and ROI assumptions.
- Database-validated draft order and simulated checkout result.
- Approval, rejection, or change-request controls with a reason and audit record.
- Approved proposal download with the existing watermark and expiry controls.

For the competition MVP, the current `/demo` journey remains the safe demonstration workspace. It is reached intentionally and grants only a short-lived, session- and order-scoped `Demo Staff Mode` token. It is not a general public staff dashboard. A production-equivalent route would require separately authenticated staff identities and is outside this public anonymous MVP.

## 3. Route and Navigation Contract

| Route | Surface | Purpose | Authorization |
| --- | --- | --- | --- |
| `/` | Public Tankroy | Company overview, featured use cases, product discovery, and advisor entry point | Anonymous session or no session |
| `/catalog` | Public Tankroy | Browse the fictional catalog | Anonymous session or no session |
| `/catalog/[slug]` | Public Tankroy | Inspect one product's grounded facts, image, constraints, and advisor entry point | Anonymous session or no session |
| `/advisor` | Public TankFit AI | Full-page conversational discovery and compatibility explanation | Anonymous signed session |
| `/demo` | Demonstration workspace | Complete customer-to-approval competition journey | Anonymous signed session; staff actions require scoped Demo Staff Mode |
| `/api/advisor` | Server boundary | AI-assisted discovery and grounded explanation | Same-origin, session-scoped request |
| `/api/proposals/[id]` | Server boundary | Generate an approved synthetic proposal on demand | Same-origin, current-session authorization, unexpired record |

The public navigation should describe the customer experience in Tankroy language. Internal labels such as `Demo Staff Mode`, `approval`, and `audit` belong inside the deliberate demonstration workspace, not in the primary public navigation.

## 4. Customer Journey

1. A visitor lands on the fictional Tankroy website and understands the synthetic-demo disclaimer.
2. The visitor browses products or opens `Ask TankFit AI` from the home page, a solution page, or a product page.
3. TankFit AI asks only compatibility-relevant discovery questions and accepts a custom fictional situation or an editable preset.
4. Deterministic code evaluates compatibility against the versioned catalog and returns a recommendation, alternatives, or `technical_review_required` / `out_of_scope`.
5. The visitor reviews facts, evidence, assumptions, and the illustrative ROI estimate.
6. The visitor may continue to the full `/demo` journey to create a synthetic draft order, authorize the fictional deposit, and enter the explicit approval demonstration.
7. The visitor returns to the customer view and downloads the approved, watermarked demo proposal.

The widget may hand off to `/advisor` or `/demo` with a server-managed session reference. It must not put secrets, raw database identifiers, or authorization claims in a client-controlled query string.

## 5. Deterministic and AI Boundaries

- AI interprets the visitor's language, extracts requirements, asks questions, and explains validated results.
- Deterministic code owns compatibility, product facts, commercial values, ROI arithmetic, order state, payment simulation, approval state, and proposal eligibility.
- The public surface may display only catalog facts returned by validated server modules.
- The internal surface may mutate state only through explicit, validated interface actions; the agent cannot approve, pay, or generate a proposal.
- The same normalized requirements must yield the same deterministic result whether the visitor arrived from a preset, the widget, `/advisor`, or a custom scenario.

## 6. Acceptance Tests

- The home page and catalog are understandable as a fictional Tankroy customer website without opening the internal demo.
- Every public page contains or links to the synthetic-data and independent-project notice.
- The widget opens on desktop and mobile, remains keyboard accessible, and can hand off to the full-page advisor.
- Product-page facts and images match the versioned catalog; no AI-generated product claim appears without grounded evidence.
- A visitor can begin with a custom scenario from the public site and reach the same deterministic result as the equivalent `/advisor` flow.
- Public pages do not render approval, audit, order mutation, or proposal-download controls for another session.
- The complete AirFlame golden path still reaches recommendation, ROI, simulated checkout, Demo Staff Mode, approval, and proposal download.
- A session-scoped Demo Staff Mode token cannot be created by the model, reused for another order, or used after expiry.
- AI-provider failure still leaves catalog browsing and deterministic guided discovery usable.
- No real company, catalog, customer record, payment, personal information, or legally valid document is introduced.

## 7. Out of Scope for This Revision

- A real authenticated employee portal.
- A second repository, backend, database, agent, or deployment.
- Wix, a CMS, or external catalog synchronization.
- Real checkout, subscriptions, customer accounts, CRM integration, or lead email delivery.
- A requirement that every public visitor create a database record before browsing.
