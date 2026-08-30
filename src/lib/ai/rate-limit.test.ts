import { beforeEach, describe, expect, it } from "vitest";
import {
  consumeAdvisorRateLimit,
  resetAdvisorRateLimitForTests,
} from "./rate-limit";

describe("advisor rate limiter", () => {
  beforeEach(() => resetAdvisorRateLimitForTests());

  it("limits repeated requests from the same client", () => {
    const request = new Request("https://tankfit.example/api/advisor", {
      headers: { "x-forwarded-for": "203.0.113.10" },
    });

    for (let attempt = 0; attempt < 6; attempt += 1) {
      expect(consumeAdvisorRateLimit(request, 1_000).allowed).toBe(true);
    }

    expect(consumeAdvisorRateLimit(request, 1_000).allowed).toBe(false);
    expect(consumeAdvisorRateLimit(request, 61_001).allowed).toBe(true);
  });
});
