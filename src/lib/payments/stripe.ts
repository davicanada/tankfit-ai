import "server-only";
import Stripe from "stripe";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { demoOrders } from "@/db/schema";
import { UserFacingError } from "@/domain/journey/errors";
import {
  attachCheckout,
  completeVerifiedCheckout,
  readCheckoutOrder,
} from "@/lib/journey-service";

export function requireTestKey(value = process.env.STRIPE_TEST_SECRET_KEY) {
  const key = value?.trim();
  if (!key || !/^(?:rk|sk)_test_\S+$/.test(key))
    throw new UserFacingError(
      "Stripe sandbox is not configured. Live payments are disabled.",
    );
  return key;
}

export function stripeClient() {
  return new Stripe(requireTestKey(), {
    maxNetworkRetries: 1,
    timeout: 10_000,
  });
}

function appOrigin() {
  const origin = new URL(
    process.env.APP_ORIGIN ?? "https://tankfit-ai.vercel.app",
  );
  if (
    origin.protocol !== "https:" &&
    !(process.env.NODE_ENV !== "production" && origin.hostname === "localhost")
  )
    throw new Error("Invalid application origin.");
  return origin.origin;
}

export function validateCheckoutUrl(value: string | null) {
  if (!value)
    throw new UserFacingError(
      "Test checkout is no longer available. Reset to start a new demo.",
    );
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "checkout.stripe.com" ||
    url.username ||
    url.password
  )
    throw new Error("Unexpected checkout destination.");
  return url.href;
}

export async function beginTestCheckout(sessionId: string, orderId: string) {
  const client = stripeClient();
  const order = await readCheckoutOrder(sessionId, orderId);
  const checkout = order.checkoutSessionId
    ? await client.checkout.sessions.retrieve(order.checkoutSessionId)
    : await client.checkout.sessions.create(
        {
          mode: "payment",
          integration_identifier: "tankfit-demo-qmnxvrpa",
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: order.currency.toLowerCase(),
                unit_amount: order.fictionalDepositCents,
                product_data: {
                  name: "FICTIONAL Tankroy pilot deposit — TEST ONLY",
                  description:
                    "Synthetic competition demo. No real money, goods, contract, or personal information.",
                },
              },
            },
          ],
          customer_email: "fictional-visitor@example.com",
          metadata: { orderId: order.id, project: "tankfit-synthetic-demo" },
          success_url: `${appOrigin()}/demo/customer`,
          cancel_url: `${appOrigin()}/demo/customer`,
        },
        { idempotencyKey: `tankfit-test-checkout-${order.id}` },
      );
  if (checkout.livemode) throw new Error("Live checkout rejected.");
  if (!order.checkoutSessionId)
    await attachCheckout(sessionId, orderId, checkout.id);
  return validateCheckoutUrl(checkout.url);
}

export async function processTestCheckout(checkout: Stripe.Checkout.Session) {
  if (
    checkout.livemode ||
    checkout.metadata?.project !== "tankfit-synthetic-demo"
  )
    throw new Error("Invalid payment context.");
  const order = await getDb().query.demoOrders.findFirst({
    where: eq(demoOrders.checkoutSessionId, checkout.id),
  });
  if (!order) throw new Error("Unknown checkout.");
  if (checkout.metadata.orderId !== order.id)
    throw new Error("Invalid order reference.");
  if (checkout.payment_status !== "paid") return;
  await completeVerifiedCheckout(order.sessionId, order.id, {
    checkoutSessionId: checkout.id,
    amount: checkout.amount_total ?? -1,
    currency: checkout.currency ?? "",
    paid: checkout.payment_status === "paid",
    livemode: checkout.livemode,
  });
}

export async function reconcileTestCheckout(sessionId: string) {
  const order = await getDb().query.demoOrders.findFirst({
    where: and(
      eq(demoOrders.sessionId, sessionId),
      eq(demoOrders.status, "draft"),
    ),
  });
  if (!order?.checkoutSessionId)
    throw new UserFacingError("No test checkout is awaiting verification.");
  const checkout = await stripeClient().checkout.sessions.retrieve(
    order.checkoutSessionId,
  );
  await processTestCheckout(checkout);
  if (checkout.payment_status !== "paid")
    throw new UserFacingError(
      "Stripe has not confirmed a successful test payment. A cancelled or failed payment cannot advance the order.",
    );
}
