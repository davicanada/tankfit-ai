import { describe, expect, it } from "vitest";
import {
  defaultAirFlameRequirements as preset,
  emptyRequirements,
} from "./types";
import { evaluateJourney } from "./evaluate";
import { journeyPresets } from "./presets";

describe("transactional compatibility", () => {
  it.each(journeyPresets)(
    "validates each explicitly confirmed fictional preset: $companyName",
    (requirements) => {
      expect(evaluateJourney(requirements).status).toBe("compatible");
      expect(
        evaluateJourney({
          ...requirements,
          companyName: "Unrelated fictional company",
        }),
      ).toEqual(evaluateJourney(requirements));
    },
  );
  it("requires catalog-condition evidence for radar and cylinder monitoring", () => {
    expect(
      evaluateJourney({ ...journeyPresets[1], foamOrObstructions: "unknown" })
        .status,
    ).toBe("technical_review_required");
    expect(
      evaluateJourney({ ...journeyPresets[2], gatewayCoverageConfirmed: false })
        .status,
    ).toBe("technical_review_required");
  });
  it("accepts confirmed AirFlame requirements and an equivalent custom organization", () => {
    expect(evaluateJourney(preset).status).toBe("compatible");
    expect(
      evaluateJourney({ ...preset, companyName: "Cloudberry Fictional Labs" }),
    ).toEqual(evaluateJourney(preset));
  });
  it.each([
    { minimumTemperatureC: -60 },
    { maximumTemperatureC: 80 },
    { minimumTemperatureC: null },
    { readingFrequency: "unknown" as const },
    { lowLevelAlerts: "unknown" as const },
    { gaugeInterface: "unknown" as const },
    { connectivity: "unavailable" as const },
    { regulatedLocation: true },
    { tankType: "underground_vented" as const },
  ])("blocks incomplete or unsafe requirements: %j", (change) => {
    expect(evaluateJourney({ ...preset, ...change }).status).toBe(
      "technical_review_required",
    );
  });
  it("does not qualify an empty scenario", () =>
    expect(evaluateJourney(emptyRequirements).status).toBe(
      "technical_review_required",
    ));
  it("rejects out-of-catalog material", () =>
    expect(evaluateJourney({ ...preset, material: "unsupported" }).status).toBe(
      "out_of_scope",
    ));
});
