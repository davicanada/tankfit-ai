# SPEC: Internal Regression Fixture Pilot Journey

> Internal test fixture only. This document is not part of the public Tankroy
> website, public onboarding, Demo Hub choices or submission narrative. The
> public product starts with a visitor-created fictional scenario.

**Status:** Consultative revision implemented; deployment validation pending
**Scenario:** AirFlame Fuels  
**Primary user:** Jordan Blake, Operations Manager  
**Purpose:** Define the first complete, testable TankFit AI journey.

**September 6 revision:** [Consultative Sales](consultative-sales.md) supersedes the payment-first order/approval sequence formerly described in this document. The technical fixture stays the same. Current steps are validated request, scoped staff approval, proposal review, customer acceptance and test payment. Incomplete opportunities can reach Sales without a commercial request. Unaccepted revisions retain history. The default fleet model has no finite payback after recurring service costs; the former 59.43-month figure is retired.

AirFlame is an editable preset and regression fixture, not a hard-coded customer-only workflow. The public Tankroy website, embedded TankFit AI assistant, full-page `/advisor`, `/demo/customer`, and `/demo/sales` must all use the same schemas, discovery logic, compatibility rules, tools, commerce validation, security controls, and approval state machine for independently entered custom scenarios.

## 1. Scenario

AirFlame Fuels is a fictional regional heating-oil distributor responsible for 500 residential tanks across rural Ontario. Many customer tanks are above ground and already use mechanical float gauges. AirFlame wants to evaluate remote monitoring before considering a larger fictional rollout.

The public demonstration represents a five-tank pilot. It does not represent a purchase for all 500 sites.

## 2. Starting Request

The visitor may open TankFit AI from the public Tankroy website, select the AirFlame preset in the guided demo, or enter an equivalent request:

> We manage 500 rural heating-oil tanks. Most are above ground and already have float gauges. We want fewer run-outs and unnecessary deliveries, but we want to test the solution on five tanks first.

## 3. Required Discovery Fields

TankFit AI must obtain or explicitly mark unknown:

- Stored material
- Number of fleet tanks
- Pilot quantity
- Tank location: above ground or underground
- Tank orientation
- Existing gauge type
- Gauge interface or thread status
- Cellular coverage status
- Desired reading frequency
- Required alert type
- Outdoor operating-temperature range
- Whether the location requires regulated or hazardous-location review

The recommendation cannot become `compatible` until every mandatory field has a supported value. Unknown gauge interface, uncertain cellular coverage, underground installation, pressurized tank, or regulated-location requirement must produce `technical_review_required` rather than a guessed answer.

## 4. Default Synthetic Answers

The preset supplies:

- Material: heating oil
- Fleet size: 500 tanks
- Pilot size: 5 tanks
- Tank type: above-ground horizontal
- Existing instrumentation: supported mechanical float gauge
- Gauge interface: confirmed compatible fictional adapter
- Connectivity: LTE-M coverage available
- Reading frequency: once per day plus alert-triggered updates
- Alert: low-level threshold
- Temperature range: -25°C to 35°C
- Regulated or hazardous location: no

Visitors may edit these answers. Editing a compatibility-critical field must rerun the deterministic rules.

A visitor who starts with `Describe your own situation` may independently provide equivalent facts without mentioning AirFlame. If the normalized requirements match this supported configuration, the same FL-100 result is expected; no preset identifier may influence compatibility ranking.

## 5. Expected Recommendation

### Primary recommendation

Five `FloatLink FL-100` monitors.

Reasons:

- Supports fictional heating-oil applications.
- Supports the selected above-ground tank types.
- Interfaces with the confirmed fictional mechanical float gauge.
- Uses direct LTE-M connectivity, which fits geographically distributed residential tanks.
- Does not require a shared on-site gateway.

### Contextual alternative

`FloatLink FL-110` plus a compatible ConnectHub may be shown only as an educational alternative for clustered tanks at one site. It must not be ranked above the FL-100 for the distributed AirFlame pilot.

### Required evidence

The interface must show the matched catalog fields, applicable constraints, catalog version, compatibility-rule version, and last-reviewed date.

## 6. Deterministic Commercial Validation

At pilot-request submission, the application must read the following fields from Neon Postgres rather than the JSON fallback:

- Unit price
- Monthly service price
- Current fictional stock quantity
- Availability status
- Estimated delivery lead time in business days

If the database cannot be reached, the visitor may continue browsing the catalog and compatibility result, but cannot submit the pilot request or complete checkout.

The initial demo seed values produce a five-unit pilot that is in stock. The application must not assume these values remain current after the pilot request is submitted; it must revalidate them again before proposal acceptance and simulated checkout.

## 7. ROI Demonstration

The ROI estimator operates on fleet-level assumptions while clearly separating the five-unit pilot order from a possible future fleet rollout.

Editable synthetic inputs:

- Fleet size
- Estimated annual run-outs
- Estimated cost per run-out
- Annual emergency deliveries
- Incremental cost per emergency delivery
- Annual manual tank checks
- Cost per manual check
- Expected percentage reduction for each category
- Hypothetical rollout hardware and service cost

Application code calculates avoided costs, estimated annual benefit, estimated first-year cost, net first-year impact, and simple payback period. The AI may explain these results but cannot change them.

## 8. Consultative Request and Approval

1. The visitor submits a validated pilot request for five FL-100 monitors. Current commercial values are read from Neon Postgres, and the requirements, recommendation evidence, ROI, commerce snapshot, and business brief are frozen as revision 1.
2. The request enters `pending_approval`; no payment is requested yet.
3. The visitor explicitly enters session-scoped Demo Staff Mode in the Sales Team Experience.
4. The demo approver reviews discovery answers, compatibility evidence, ROI assumptions, order values, business objective, pilot success criteria, and audit events.
5. Approval, rejection, or a change request records the role, reason, and timestamp. A change request can be superseded by a new revision before customer acceptance; prior snapshots and decisions remain in history.
6. Approval creates eligibility for a clearly marked, non-binding proposal. The proposal is generated from the approved revision, not from mutable session values.
7. The visitor returns to Customer Experience, reviews the proposal, and explicitly selects `Accept proposal` for that revision.
8. Only after acceptance does Stripe-hosted test Checkout collect test-only details for a fictional deposit. A verified test session with the expected stored ID, amount and currency moves the request to `paid`; cancellation or provider failure leaves it accepted but unpaid.

Customer order controls belong to Customer Experience. Approval and audit controls belong to the explicitly labeled `/demo/sales` Sales Team Experience. The public Tankroy catalog and advisor surfaces may explain the journey and hand off to the demo modes, but must not display approval controls or another session's order.

If an evaluator opens Sales Team Experience without an eligible current-session opportunity, `Load prepared AirFlame opportunity` may create a new private fixture through a validated server mutation. The fixture must reproduce the documented AirFlame requirements, run the normal deterministic and current commercial validation, record its provenance, and remain isolated to the evaluator's anonymous session.

## 9. Proposal

Every page must display `DEMO - NOT A VALID QUOTE OR CONTRACT`. The proposal includes fictional parties, pilot scope, database-validated values, assumptions, approval note, evidence versions and synthetic-demo terms. It is generated only from an approved, unexpired, session-owned order's immutable snapshot. Legacy orders without snapshots fail closed. The English PDF normalizes unsupported font characters; original visitor text remains in the session.

The prepared opportunity remains a pending request until it is approved, accepted, and (optionally) paid through the normal test Checkout path.

### Synthetic operating profiles

`data/catalog/operating-profiles.json` defines fictional temperature, reporting and alert capabilities. Relevant catalog constraints require explicit evidence: clear radar path, absence of foam/obstructions, cylinder footprint, sheltered installation, gateway coverage or wetted-material review. Unknown evidence blocks compatibility. These are synthetic assumptions, never certifications or engineering advice. `src/domain/journey/presets.ts` contains editable examples; names never influence evaluation. Only the fully validated primary product is a transactional match.

## 10. Acceptance Tests

- The default preset recommends FL-100 and no incompatible product.
- Changing the tank to underground removes FL-100 and returns technical review.
- Changing connectivity to unavailable prevents a direct-cellular recommendation.
- An unknown gauge interface returns technical review.
- The assistant cannot alter price, stock, lead time, or compatibility through conversation.
- A custom fictional company with equivalent normalized requirements receives the same compatibility result as the AirFlame preset.
- Prompt injection inside a company name or problem description cannot change tools, session scope, catalog facts, provider destinations, or approval state.
- Malicious HTML, SQL-like text, paths, URLs, XML, commands, and unexpected JSON fields remain inert input and cannot reach an executable sink.
- Database unavailability prevents order submission but not descriptive browsing.
- Insufficient stock prevents the requested quantity from proceeding unchanged.
- Proposal generation fails without approval.
- One session cannot view or approve another session's order.
- The complete happy path produces a downloadable, clearly marked demo proposal.
- A visitor can start the same AirFlame journey from the public Tankroy website or the full-page advisor without changing the deterministic recommendation.
- Public pages do not expose Demo Staff Mode, approval, audit, or order-mutation controls before the deliberate workspace handoff.
- The Demo Hub lets an evaluator choose Customer Experience or Sales Team Experience without granting a role.
- Sales Team Experience can continue the current session's AirFlame opportunity or explicitly create a distinct session-private prepared fixture.
- A prepared fixture cannot bypass deterministic compatibility, commercial revalidation, approval authorization, or cross-session isolation.
