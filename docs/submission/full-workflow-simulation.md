# Full Fictional Workflow Simulation

This is a narrated happy-path example for the Tankroy public website and the
TankFit AI internal demonstration workspace. Every organization, person,
product, specification, price, payment, and business result below is fictional
and synthetic. Do not enter real personal, contact, payment, or confidential
information.

## Scenario

AirFlame Fuels is a fictional regional heating-oil distributor with 500 rural
tanks. The operations team wants fewer run-outs, unnecessary deliveries, and
manual checks. It wants to test five tanks before considering a larger
fictional rollout.

The visitor's fictional requirements are:

| Requirement | Value |
| --- | --- |
| Stored material | Heating oil |
| Fleet size | 500 tanks |
| Pilot quantity | 5 monitors |
| Tank installation | Above-ground, horizontal |
| Existing instrument | Mechanical float gauge |
| Gauge interface | Confirmed compatible fictional interface |
| Connectivity | LTE-M cellular |
| Reading frequency | Daily |
| Alert | Low-level threshold |
| Outdoor temperature | -25°C to 35°C |
| Regulated location | No |

AirFlame is only a convenient editable preset. A visitor who enters the same
normalized facts for another fictional organization must receive the same
deterministic result.

## Flow at a glance

```text
Tankroy public site
       |
       v
TankFit AI discovery (plain-language conversation)
       |
       v
Customer Experience: review facts -> deterministic validation
       |
       v
Draft five-unit pilot -> current Postgres commerce validation
       |
       v
Stripe test Checkout -> signed callback and reconciliation
       |
       v
Sales Team Experience: scoped review -> explicit decision
       |
       v
Approved fictional proposal (watermarked PDF)
```

## Complete walkthrough

### 1. A visitor starts on the public Tankroy site

The visitor opens the public Tankroy home page, sees the fictional-data notice,
browses the catalog, and opens **Ask TankFit AI**. The assistant is a website
conversation, not a hidden administrator or a purchasing authority.

The visitor begins with a broad question:

> **Visitor:** What products do you offer?

> **TankFit AI:** Tankroy Systems Inc. has a fictional catalog of remote tank
> monitoring products, including FloatLink, RadarSight, PressureLink,
> HydroSense, GasWeight, ConnectHub, SolarRelay, and SiteDisplay. I can explain
> a product or help narrow down a solution. Are you looking for level
> monitoring for a particular tank or fluid?

The answer gives a useful catalog overview first. It does not start with a
long technical questionnaire.

### 2. The assistant discovers the need progressively

The visitor describes the business problem in ordinary language:

> **Visitor:** We manage 500 rural heating-oil tanks. We want to reduce
> run-outs and emergency deliveries, and test five sites first.

> **TankFit AI:** That sounds like a five-monitor pilot across a distributed
> heating-oil fleet. Are the pilot tanks above ground or underground?

> **Visitor:** Above-ground horizontal tanks.

> **TankFit AI:** Do they already use mechanical float gauges with a confirmed
> compatible interface?

> **Visitor:** Yes, they do.

> **TankFit AI:** What connectivity is available at the pilot sites: LTE-M,
> another cellular option, gateway coverage, or unknown?

> **Visitor:** LTE-M cellular coverage is available.

> **TankFit AI:** How often should the pilot report readings?

> **Visitor:** Once a day.

> **TankFit AI:** Should it alert the team when a tank reaches a low-level
> threshold?

> **Visitor:** Yes.

> **TankFit AI:** What outdoor temperature range should the pilot cover?

> **Visitor:** From -25 to 35 degrees Celsius.

> **TankFit AI:** Does the installation require regulated or hazardous-location
> review?

> **Visitor:** No.

> **TankFit AI:** Thanks. FloatLink FL-100 is the strongest current catalog
> candidate for these stated facts. I will not finalize compatibility in chat.
> Review the structured facts in Customer Experience so the deterministic
> assessment can validate them.

The assistant keeps the interaction accessible by asking one focused question
at a time. If the visitor answers “I don't know,” the field remains explicitly
unknown. The assistant never guesses, approves an order, changes a price, or
turns a conversational statement into a transaction by itself.

If the visitor instead asks for satellite connectivity, the assistant explains
that the fictional catalog does not list satellite support, asks whether LTE-M
is an acceptable alternative, and routes an unresolved case to technical review.
No order can be created from that unresolved path.

### 3. The visitor reviews facts in Customer Experience

The visitor selects **Review facts and continue the customer journey**. In
**Customer Experience**, the extracted values are editable and shown in a
structured form. The visitor checks the five-unit pilot separately from the
500-tank fleet and selects **Confirm requirements**.

The server then runs the deterministic compatibility rules. The model's prose
is not the source of truth.

The result shown to the visitor is:

- **Status:** Compatible
- **Primary product:** FloatLink FL-100
- **Quantity:** Five pilot monitors
- **Why it matches:** heating-oil support, above-ground tank support,
  confirmed mechanical-float interface, direct LTE-M for distributed sites,
  and no shared gateway requirement
- **Evidence:** matched catalog fields and recorded catalog/rule versions

Fields that are not needed for this product remain explicitly unknown instead
of being silently inferred. Any edit to a compatibility-critical field reruns
the same deterministic assessment.

### 4. The visitor reviews current commercial data and the business case

After confirmation, the application reads the current fictional commerce
snapshot from Postgres. The descriptive JSON catalog remains useful for
browsing, but it cannot confirm transactional facts.

For this demonstration seed, the visitor sees:

| Commercial fact | Current fictional value |
| --- | ---: |
| FloatLink FL-100 unit price | CAD 189 |
| Monthly service per monitor | CAD 4 |
| Available stock | 48 units |
| Estimated lead time | 3 business days |
| Five-unit hardware subtotal | CAD 945 |
| Monthly service for the pilot | CAD 20 |

The page also displays an **illustrative fleet business case** using editable
synthetic assumptions. The default 500-tank calculation is CAD 23,928 estimated
annual benefit, CAD 118,500 estimated first-year fleet rollout cost, CAD
-94,572 estimated first-year net impact, and a 59.43-month simple payback.
These are not a quote, forecast, or promise; the five-unit pilot and the
possible fleet rollout are intentionally shown as separate scopes.

### 5. The visitor creates a frozen draft order

The visitor selects **Create draft order**. The server locks a session-owned
five-unit pilot snapshot and revalidates product, stock, price, currency, and
lead time in a transaction. The order is still only a fictional draft.

The page shows **Pilot order · draft** and explains that the scope is frozen.
To test a different revision, the visitor must select **Reset demo** and start
a new session-owned journey.

### 6. The visitor completes a Stripe test checkout

The visitor selects **Open Stripe test checkout**. The hosted page is explicitly
test-only. For the happy path, the visitor uses:

- Stripe test card: `4242 4242 4242 4242`
- Any future expiry date
- Any fictional three-digit CVC
- A fictional identity such as `Demo Visitor` and
  `demo@example.invalid`

The displayed fictional deposit is CAD 250. No real money, product, or customer
record is created. The signed callback and server reconciliation verify the
stored Checkout ID, test mode, expected amount, and currency before changing
state.

After returning to the app, the visitor selects **Check test payment status**
if the callback has not appeared yet. A successful verified test payment moves
the order from `draft` to `pending_approval` and records an audit event. A
cancellation, decline, provider failure, missing configuration, wrong amount,
or live-mode object leaves the order ineligible for approval.

### 7. The opportunity moves to Sales Team Experience

The visitor selects **Continue in Sales Team Experience**. This is a deliberate
presentation-mode handoff using the same unguessable anonymous session. It is
not a general staff role and it does not expose another visitor's data.

The Sales Team Experience shows:

- The conversation transcript and normalized requirements
- The deterministic compatibility result and evidence
- The current commercial snapshot
- ROI assumptions and calculated result
- The frozen order and its payment/audit history

Only now does the reviewer select **Enter Demo Staff Mode**. The mode is short
lived and scoped to this session and order only.

### 8. Sales reviews and makes an explicit decision

The reviewer enters a fictional note:

> **Decision note:** The synthetic five-site pilot matches the confirmed
> heating-oil, above-ground, compatible-float, LTE-M requirements. Proceed with
> proposal generation for evaluation only.

The reviewer selects **Approve pilot**. The server validates that the order is
still the current session's verified `pending_approval` order and records the
decision, actor, note, and timestamp. The AI cannot call this mutation and
cannot approve its own output.

The same screen also supports **Request changes** or **Reject**. Either choice
stops proposal generation until a new valid workflow is completed.

### 9. The visitor downloads the fictional proposal

After approval, **Download fictional proposal** becomes available. The
proposal is generated only from the approved order's immutable snapshot and
contains:

- Fictional parties and five-unit pilot scope
- Database-validated commercial values
- Synthetic ROI assumptions and calculations
- Compatibility evidence and recorded versions
- The sales decision note and approval timestamp
- Synthetic-demo terms

Every page is marked:

> **DEMO - NOT A VALID QUOTE OR CONTRACT**

The proposal is private to the session. An unrelated browser session cannot
open its URL.

### 10. The demo is safely repeatable

The visitor selects **Reset demo** to remove the current session's temporary
records and can replay the scenario with different fictional facts. A new
custom organization with equivalent normalized requirements should produce the
same FL-100 result. A changed tank type, unknown interface, unavailable
connectivity, unsupported material, or unresolved safety evidence should stop
the commercial path and return technical review instead of forcing a match.

## What the workflow demonstrates

| Layer | What it is responsible for |
| --- | --- |
| TankFit AI | Understands language, extracts explicit facts, asks helpful questions, and explains validated results |
| Deterministic domain rules | Decide compatibility, required evidence, and whether a product can proceed |
| Postgres commerce snapshot | Supplies current price, stock, availability, and lead time for transactions |
| Stripe test integration | Simulates payment and verifies a signed, test-only callback |
| Sales Team Experience | Lets an explicitly scoped reviewer approve, request changes, or reject |
| Proposal generator | Produces a private, watermarked document only after approval |

This separation is the core safety and evaluation story: the AI makes the
conversation natural, while deterministic code and current transactional data
decide what the system is allowed to do.

