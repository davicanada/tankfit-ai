# SPEC: AirFlame Fuels Pilot Journey

**Status:** Draft  
**Scenario:** AirFlame Fuels  
**Primary user:** Jordan Blake, Operations Manager  
**Purpose:** Define the first complete, testable TankFit AI journey.

AirFlame is an editable preset and regression fixture, not a hard-coded customer-only workflow. The same schemas, discovery logic, compatibility rules, tools, commerce validation, security controls, and approval state machine must serve independently entered custom scenarios.

## 1. Scenario

AirFlame Fuels is a fictional regional heating-oil distributor responsible for 500 residential tanks across rural Ontario. Many customer tanks are above ground and already use mechanical float gauges. AirFlame wants to evaluate remote monitoring before considering a larger fictional rollout.

The public demonstration represents a five-tank pilot. It does not represent a purchase for all 500 sites.

## 2. Starting Request

The visitor may select the AirFlame preset or enter an equivalent request:

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

At draft-order creation, the application must read the following fields from Neon Postgres rather than the JSON fallback:

- Unit price
- Monthly service price
- Current fictional stock quantity
- Availability status
- Estimated delivery lead time in business days

If the database cannot be reached, the visitor may continue browsing the catalog and compatibility result, but cannot submit the draft order or complete checkout.

The initial demo seed values produce a five-unit pilot that is in stock. The application must not assume these values remain current after the draft order is created; it must revalidate them again before simulated checkout.

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

## 8. Order and Approval

1. The visitor creates a draft order for five FL-100 monitors.
2. The database revalidates commercial data.
3. The mock-payment adapter simulates a refundable demo-kit deposit without requesting real card information.
4. The order moves to `pending_approval`.
5. The visitor explicitly enters session-scoped Demo Staff Mode.
6. The demo approver reviews discovery answers, compatibility evidence, ROI assumptions, order values, and audit events.
7. Approval, rejection, or change request records the role, reason, and timestamp.
8. Only approval permits proposal generation.

## 9. Proposal

Every page must display `DEMO - NOT A VALID QUOTE OR CONTRACT`. The proposal includes the fictional parties, pilot scope, products, database-validated commercial values, estimated lead time, assumptions, unresolved issues, approval event, catalog version, and generation timestamp.

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
