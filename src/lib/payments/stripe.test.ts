import { describe, expect, it } from "vitest";
import { requireTestKey, validateCheckoutUrl } from "./stripe";

describe("test-only Stripe boundary", () => {
  it.each([
    "",
    "sk_live_fixture",
    "rk_live_fixture",
    "random",
    "pk_test_fixture",
  ])("rejects non-test server credentials", (key) =>
    expect(() => requireTestKey(key)).toThrow(),
  );
  it("accepts restricted test credentials", () =>
    expect(requireTestKey("rk_test_fixture")).toBe("rk_test_fixture"));
  it.each([
    "https://attacker.invalid",
    "https://checkout.stripe.com.attacker.invalid",
    "http://checkout.stripe.com",
    "javascript:alert(1)",
    "https://user@checkout.stripe.com",
  ])("rejects unsafe redirects", (url) =>
    expect(() => validateCheckoutUrl(url)).toThrow(),
  );
  it("accepts only hosted checkout", () =>
    expect(
      validateCheckoutUrl("https://checkout.stripe.com/c/pay/test_fixture"),
    ).toContain("checkout.stripe.com"));
});
