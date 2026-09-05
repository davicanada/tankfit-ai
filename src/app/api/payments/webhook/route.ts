import { processTestCheckout, stripeClient } from "@/lib/payments/stripe";

export const runtime = "nodejs";

// Sole cross-origin mutation exception: Stripe authenticates the raw payload.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_TEST_WEBHOOK_SECRET;
  if (!signature || !secret)
    return new Response("Invalid webhook", { status: 400 });
  if (Number(request.headers.get("content-length") ?? 0) > 65_536)
    return new Response("Too large", { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return new Response("Invalid webhook", { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 65_536) {
      await reader.cancel();
      return new Response("Too large", { status: 413 });
    }
    chunks.push(value);
  }
  let event;
  try {
    event = stripeClient().webhooks.constructEvent(
      Buffer.concat(chunks),
      signature,
      secret,
    );
  } catch {
    return new Response("Invalid webhook", { status: 400 });
  }
  if (event.livemode)
    return new Response("Live mode rejected", { status: 400 });
  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    )
      await processTestCheckout(event.data.object);
    return new Response("Received", { status: 200 });
  } catch {
    // Non-2xx lets Stripe retry transient DB failures without trusting a redirect.
    return new Response("Payment verification unavailable", { status: 503 });
  }
}
