import { describe, expect, it } from "vitest";
import {
  readBoundedJsonBody,
  validateAdvisorRequestHeaders,
} from "./request-security";

function request(headers: Record<string, string>, body = "{}") {
  return new Request("https://tankfit.example/api/advisor", {
    method: "POST",
    headers,
    body,
  });
}

describe("advisor request security", () => {
  it("accepts same-origin JSON requests", () => {
    expect(
      validateAdvisorRequestHeaders(
        request({
          "content-type": "application/json",
          origin: "https://tankfit.example",
          "sec-fetch-site": "same-origin",
        }),
      ),
    ).toBeNull();
  });

  it("rejects cross-origin requests", () => {
    expect(
      validateAdvisorRequestHeaders(
        request({
          "content-type": "application/json",
          origin: "https://attacker.example",
          "sec-fetch-site": "cross-site",
        }),
      )?.status,
    ).toBe(403);
  });

  it("rejects requests without an origin", () => {
    expect(
      validateAdvisorRequestHeaders(
        request({ "content-type": "application/json" }),
      )?.status,
    ).toBe(403);
  });

  it("rejects non-JSON content", () => {
    expect(
      validateAdvisorRequestHeaders(
        request({
          "content-type": "application/xml",
          origin: "https://tankfit.example",
        }),
      )?.status,
    ).toBe(415);
  });

  it("enforces the body limit even without a content-length header", async () => {
    const oversized = request(
      {
        "content-type": "application/json",
        origin: "https://tankfit.example",
      },
      JSON.stringify({ text: "x".repeat(17_000) }),
    );

    expect((await readBoundedJsonBody(oversized)).status).toBe(413);
  });
});
