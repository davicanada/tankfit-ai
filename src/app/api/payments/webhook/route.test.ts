import Stripe from "stripe";
import { afterEach, describe, expect, it, vi } from "vitest";
const processCheckout = vi.hoisted(() => vi.fn());
vi.mock("@/lib/payments/stripe", () => ({
  stripeClient: () => new Stripe("sk_test_local_fixture"),
  processTestCheckout: processCheckout,
}));
import { POST } from "./route";

const secret = "whsec_local_fixture_not_a_credential";
function request(event: object, timestamp?: number) {
  const payload = JSON.stringify(event);
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
    timestamp,
  });
  return new Request("http://localhost/api/payments/webhook", {
    method: "POST",
    headers: { "stripe-signature": signature },
    body: payload,
  });
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe("signed test-payment callbacks", () => {
  it("rejects forged signatures and stale replay timestamps", async () => {
    vi.stubEnv("STRIPE_TEST_WEBHOOK_SECRET", secret);
    const forged = new Request("http://localhost/api/payments/webhook", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=forged" },
      body: "{}",
    });
    expect((await POST(forged)).status).toBe(400);
    expect((await POST(request({ livemode: false }, 1))).status).toBe(400);
    expect(processCheckout).not.toHaveBeenCalled();
  });
  it("rejects a correctly signed live event", async () => {
    vi.stubEnv("STRIPE_TEST_WEBHOOK_SECRET", secret);
    expect((await POST(request({ livemode: true }))).status).toBe(400);
    expect(processCheckout).not.toHaveBeenCalled();
  });
  it("accepts a signed test event and requests retries on processing failures", async () => {
    vi.stubEnv("STRIPE_TEST_WEBHOOK_SECRET", secret);
    const event = {
      livemode: false,
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_fixture" } },
    };
    expect((await POST(request(event))).status).toBe(200);
    expect(processCheckout).toHaveBeenCalledWith(event.data.object);
    processCheckout.mockRejectedValueOnce(new Error("Database unavailable"));
    expect((await POST(request(event))).status).toBe(503);
  });
});
