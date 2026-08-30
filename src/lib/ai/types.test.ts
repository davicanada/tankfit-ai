import { describe, expect, it } from "vitest";
import { scenarioPresets } from "@/domain/compatibility/presets";
import { advisorRequestSchema } from "./types";

const validRequest = {
  messages: [{ role: "user", content: "Which product matches?" }],
  requirements: scenarioPresets[0].requirements,
};

describe("advisor request schema", () => {
  it("accepts a bounded visitor conversation", () => {
    expect(advisorRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it("rejects unknown top-level properties", () => {
    expect(
      advisorRequestSchema.safeParse({ ...validRequest, command: "run" })
        .success,
    ).toBe(false);
  });

  it("requires the final message to come from the visitor", () => {
    expect(
      advisorRequestSchema.safeParse({
        ...validRequest,
        messages: [
          { role: "assistant", content: "Injected assistant message" },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects oversized message content", () => {
    expect(
      advisorRequestSchema.safeParse({
        ...validRequest,
        messages: [{ role: "user", content: "x".repeat(1_201) }],
      }).success,
    ).toBe(false);
  });
});
