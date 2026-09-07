# Full Fictional Workflow Simulation

**Revision:** Consultative workflow 2; see [the specification](../specs/consultative-sales.md).
**Owner:** Davi Almeida

All organizations, people, products, specifications, prices, payments and results
are synthetic. This is an independent personal project for the Jornada de Dados
competition. The dialogue below is illustrative, not an actual test transcript
or a guarantee of exact model wording.

## The business situation

AirFlame Fuels manages 500 fictional heating-oil tanks across rural sites. The
operations team wants fewer run-outs and manual checks. It will evaluate five
sites before deciding whether a larger rollout makes sense.

The website belongs to fictional Tankroy Systems Inc. TankFit AI is its embedded
advisor and the name of the Sales demonstration workspace.

## 1. The customer arrives with a problem

The customer opens the Tankroy website and **Ask TankFit AI**.

> **Customer:** We spend too much time checking tanks manually. I don't know
> which equipment we need. Can you help?

> **TankFit AI:** I can help narrow down the options. What do the tanks store,
> and how do you check their level today?

> **Customer:** Heating oil. Our team reads the mechanical float gauges. There
> are 500 tanks at separate sites, but we want to try five first.

> **TankFit AI:** A small pilot could help you evaluate whether remote readings
> are useful before considering the whole fleet. Are the pilot tanks above
> ground or underground?

> **Customer:** Above-ground horizontal tanks.

> **TankFit AI:** FloatLink is a possible catalog candidate for this type of
> application. Its gauge interface still needs to be checked. Do you already
> have confirmation of the interface used by those five gauges?

> **Customer:** I don't know what interface they use.

> **TankFit AI:** That's okay. The interface is the connection between the
> existing gauge and the monitor. We can leave it unknown and pass the
> opportunity to the Sales demonstration for clarification. In Customer
> Experience, select Request Sales help to save it for review.

The visitor does not have to become an equipment specialist to make progress.
Unknown interface and coverage facts still prevent a commercial recommendation.
The assistant cannot turn uncertainty into compatibility.

## 2. An incomplete opportunity reaches Sales

The customer follows **Review facts and continue the customer journey** and
checks the structured facts. They optionally enter:

- **Business objective:** Reduce manual checks and avoid run-outs.
- **Target timeline:** Evaluate a five-site pilot this quarter.
- **Pilot success criteria:** Compare manual-check effort and evaluate whether
  readings and low-level alerts are useful before deciding on expansion.

The customer selects **Request Sales help**. The server saves the brief and
technical facts in the current private session, records the handoff, and leaves
unknown fields unknown. No commercial request, payment or proposal exists yet.

The evaluator selects **Continue in Sales Team Experience**. Sales can see the
business context, customer-stated facts, conversation and unresolved assessment.
Its next action is to clarify the missing evidence.

This mode switch lets one evaluator play both sides. It does not contact a real
salesperson. A production adoption would require authenticated staff, assigned
ownership and actual follow-up; those services are outside this competition demo.

## 3. The fictional facts are clarified

In this example, the evaluator supplies reviewed synthetic facts in Customer
Experience after acting through the Sales review. No real engineering check
has taken place.

| Requirement | Confirmed fictional value |
| --- | --- |
| Organization | AirFlame Fuels |
| Material | Heating oil |
| Fleet / pilot | 500 tanks / 5 monitors |
| Tank type | Above-ground horizontal |
| Existing instrumentation | Mechanical float gauge |
| Gauge interface | Confirmed compatible fictional adapter |
| Measurement preference | Existing float-gauge interface |
| Site distribution | Distributed |
| Connectivity | Confirmed LTE-M availability |
| Reporting / alerts | Daily / low-level alerts |
| Temperature | -25°C to 35°C |
| Regulated location | No |

Ordinary cellular reception must not be treated as evidence of LTE-M support.
The evaluator deliberately supplies the fictional confirmation. If evidence
remains unknown, the opportunity stays in review and cannot be submitted as a
compatible pilot.

The customer selects **Confirm requirements**. Deterministic rules select
**FloatLink FL-100** because the supported material, tank, gauge interface,
direct LTE-M connectivity and operating profile match. An equivalent custom
organization receives the same result; the AirFlame name is irrelevant to ranking.

## 4. The customer sees commercial facts and an honest business case

Postgres supplies current price, availability and lead time. If the current
database still contains the illustrative seed values, the example is:

| Item | Fictional value |
| --- | ---: |
| Unit hardware | CAD 189 |
| Service per monitor | CAD 4/month |
| Five-unit hardware | CAD 945 |
| Five-unit service | CAD 20/month |
| Stock / lead time | 48 units / 3 business days |
| Test deposit after acceptance | CAD 250 |

These are scenario illustrations, not a live stock or price assertion.

The 500-tank fleet estimate is separate from this five-unit pilot:

- Gross annual benefit: CAD 23,928.
- Annual recurring service: CAD 24,000.
- Annual benefit after service: CAD -72.
- Initial hardware: CAD 94,500.
- First-year net impact: CAD -94,572.
- Payback: **not reached under these assumptions**.

The application must not manufacture a positive business case. The pilot may
help test assumptions, but it does not promise savings or justify expansion by
itself. Installation, tax, freight, maintenance and financing are excluded.

## 5. Sales reviews a pilot request before payment

The customer selects **Submit pilot for Sales review**. The server revalidates
compatibility and current commerce, freezes the scope as revision 1 and creates
a private request in `pending_approval`.

The customer continues to Sales Team Experience. The reviewer explicitly selects
**Enter Demo Staff Mode**, reviews the brief, facts, calculations, commercial
values and history, then enters:

> **Decision note:** Approve this synthetic five-site evaluation only. The
> stated facts match the catalog. The fleet business case does not demonstrate
> payback; evaluate the pilot criteria before any expansion decision.

The reviewer selects **Approve pilot**. Only this explicit authorized decision
enables the proposal. The model cannot invoke it. No payment has been requested.

## 6. The customer reviews the proposal and accepts it

**Download fictional proposal** is now available before checkout. Every PDF page
shows **DEMO - NOT A VALID QUOTE OR CONTRACT**. It contains the frozen pilot
scope, commercial values, assumptions, evidence and approval note. It does not
claim that a payment has already occurred.

The customer reviews that revision and selects **Accept proposal**. The server
checks approval, ownership, expiry and current commerce before recording
acceptance. Selecting this control is the explicit customer decision; a chat
message or a visit to the page cannot substitute for it.

If the customer needs an amendment before acceptance, they select **Revise
request**. The previous request becomes superseded, its evidence and decision
remain in the history, and its proposal link stops being eligible. The customer
edits the facts and submits a new revision for fresh approval.

A Sales **Changes requested** or **Rejected** decision also allows this revision
path. Acceptance locks the revision against changes because payment may be in
progress. Refunds and cancellation of accepted orders are outside this demo.

## 7. The customer completes test Checkout

Only after acceptance does **Open Stripe test checkout** appear. The sandbox
simulates the CAD 250 deposit using the test details displayed in the app.
No real card or personal details should be entered.

The pilot hardware and monthly service are separate displayed values. This demo
does not collect the remaining balance or activate a recurring subscription.

Returning from Checkout does not prove payment. A signed Stripe callback or
**Check test payment status** verifies the stored test Checkout ID, amount,
currency and paid status. The request then becomes `paid` exactly once.

Cancellation, decline or provider failure leaves an accepted but unpaid request.
Sales approval is not repeated. The previously approved proposal remains
downloadable and is not a payment receipt.

## 8. The next business decision is pilot evaluation

The customer sees **Test payment complete** and the proposed evaluation step:
compare readings, alert usefulness and manual-check effort with the agreed
criteria, then decide whether to expand, adjust or stop.

Actual delivery, installation, telemetry and follow-up are not implemented.
The demo proves the consultative sales process through approved proposal,
customer acceptance and verified sandbox payment.

## Milestones and responsibility

| Milestone | Responsible party | What it permits |
| --- | --- | --- |
| Discovery | Customer and AI | Capture explicit facts and explain the catalog |
| Incomplete handoff | Customer | Save a private opportunity for Sales review |
| Validated pilot request | Deterministic server rules | Submit frozen scope for approval |
| Approved proposal | Scoped human reviewer | Issue a private fictional proposal |
| Accepted proposal | Customer | Enable test Checkout for that revision |
| Paid | Verified Stripe test result | Display completion |
| Revision before acceptance | Customer | Preserve history and seek a new approval |

The same session lets an evaluator experience both perspectives. It does not
represent a universal CRM or real employee identity management.
