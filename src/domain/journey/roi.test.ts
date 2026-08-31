import { describe, expect, it } from "vitest";
import { calculateRoi } from "./roi";
import { defaultRoiAssumptions } from "./types";

describe("calculateRoi", () => {
  it("calculates an auditable AirFlame estimate without model input", () => {
    const result = calculateRoi({
      fleetSize: 500,
      assumptions: defaultRoiAssumptions,
      commerce: {
        productId: "TR-FL100",
        commerceVersion: "2026.08.1",
        currency: "CAD",
        unitPriceCad: 189,
        monthlyServiceCad: 4,
        stockQuantity: 48,
        availability: "in_stock",
        leadTimeBusinessDays: 3,
      },
    });

    expect(result.estimatedAnnualBenefitCad).toBe(23_928);
    expect(result.estimatedFirstYearRolloutCostCad).toBe(118_500);
    expect(result.estimatedFirstYearNetCad).toBe(-94_572);
    expect(result.estimatedPaybackMonths).toBe(59.43);
  });
});
