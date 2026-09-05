# Stripe Test Setup

This application must never use live Stripe credentials or real payment details.

1. Open a Stripe sandbox owned by Davi Almeida.
2. Create a restricted **test** key with the permissions needed to create/read Checkout Sessions and their inline product/price/payment dependencies. Store it as `STRIPE_TEST_SECRET_KEY` in the ignored `.env.local`, and as a sensitive variable in the target Vercel environment. Never paste the value into chat or commit it.
3. Set `APP_ORIGIN` to the exact application origin for that environment.
4. Register a sandbox webhook at `APP_ORIGIN/api/payments/webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Store its signing secret as `STRIPE_TEST_WEBHOOK_SECRET`.
5. Redeploy after environment changes. Run a test checkout and verify both the webhook and explicit payment-status reconciliation.

Use only the Stripe test card `4242 4242 4242 4242`, a future expiry and a fictional CVC. Keep the supplied fictional email. A cancelled or declined test payment must leave the order in draft. An unavailable sandbox must not silently become an internal mock payment.

Only a live Stripe context was exposed by the connected account during the September 5 implementation session. Sandbox credential configuration and live sandbox verification remain owner-dependent until test access is available.

Reference: [Stripe Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment).
