# Evaluator Walkthrough

Use fictional information and test payment details only. This is Davi Almeida's independent Jornada de Dados project, not a real supplier or employee system.

For a narrated end-to-end example with dialogue and expected system states, see
[Full Fictional Workflow Simulation](submission/full-workflow-simulation.md).

## Customer Experience

1. Open the Tankroy home page, browse a product and open **Ask TankFit AI**.
2. Describe a fictional monitoring problem in your preferred language. Answer discovery questions, then follow **Review facts and continue the customer journey**.
3. Alternatively open `/demo/customer`, select **AirFlame Fuels**, and review its editable technical facts. The example covers 500 tanks but only a five-unit pilot.
4. Select **Confirm requirements**. Inspect the deterministic match, database-backed price/stock/lead time and illustrative ROI. You can edit assumptions and recalculate before creating an order.
5. Select **Create draft order**. Its scope is now frozen; use **Reset demo** for a different revision.
6. Select **Open Stripe test checkout**. This requires configured owner-controlled sandbox credentials. Use only Stripe's test card and the supplied fictional identity; never real personal or payment information.
7. Return to the demo and use **Check test payment status** if the signed callback has not yet updated the order. A cancelled, declined or unavailable checkout must not produce approval eligibility.

## Sales Team Experience

1. Open `/demo/sales` in the same browser session. Review the conversation, confirmed requirements, ROI assumptions, order and audit.
2. A fresh session can explicitly **Load prepared AirFlame opportunity**. This creates a private draft, not a paid order. Follow Customer Experience to complete test checkout.
3. Only an eligible paid test order exposes **Enter Demo Staff Mode**. This is a short-lived token for this session/order, not general administrator access.
4. Enter a fictional decision note and approve, request changes or reject. Only approval permits **Download fictional proposal**.
5. Verify the two-page document's `DEMO - NOT A VALID QUOTE OR CONTRACT` marking. Use **Reset demo** to remove this session's records and start again.

## Useful Negative Checks

- Start a custom scenario with unknown coverage or an unsupported material: do not expect an eligible order.
- Open an approved proposal URL in a different incognito session: it must be inaccessible.
- Try an unrelated chat request or an instruction to approve an order: the conversation must not change payment/approval state.
- Unavailable AI keeps the guided catalog useful; unavailable Postgres blocks commerce and transactions. Missing Stripe configuration is a visible checkout blocker, not a successful mock payment.

## Automated Verification

`npm run check` runs the normal local gate. `npm run test:e2e` runs secret-free public browser checks. Database and live-provider tests are deliberately opt-in.

PowerShell database browser test:

```powershell
$env:E2E_DATABASE = '1'
npm run test:e2e -- e2e/customer-journey.spec.ts e2e/public-experience.spec.ts
```

For an authorized protected Vercel preview, set `E2E_BASE_URL` to the exact origin and `E2E_ACCESS_URL` to its temporary share URL in the process environment, never in committed files. Authentication state is stored only under ignored `tmp/e2e`, separately for each deployment. Traces are disabled for these protected runs.

Set `E2E_LIVE_AI=1` and run `e2e/live-discovery.spec.ts --project=chromium` to capture nine language fixtures, respecting rate limits. Review the captured response and audit files semantically; passing HTTP/schema assertions does not by itself prove language quality, grounding or safety. Do not run this suite repeatedly against free quotas without checking provider failures.
