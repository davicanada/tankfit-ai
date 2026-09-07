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
    expect(result.estimatedPaybackMonths).toBeNull();
  });
  it.each([
    [100, 100, 0, 12],
    [200, 100, 5, 60],
    [200, 60, 5, null],
    [200, 0, 0, null],
    [0, 100, 0, 0],
  ])(
    "hardware %s and annual benefit %s with monthly service %s gives payback %s",
    (hardware, benefit, monthly, expected) => {
      const result = calculateRoi({
        fleetSize: 1,
        assumptions: {
          ...defaultRoiAssumptions,
          annualRunouts: 1,
          costPerRunoutCad: benefit,
          runoutReductionPercent: 100,
          annualEmergencyDeliveries: 0,
          annualManualChecks: 0,
        },
        commerce: {
          productId: "test",
          commerceVersion: "test",
          currency: "CAD",
          unitPriceCad: hardware,
          monthlyServiceCad: monthly,
          stockQuantity: 1,
          availability: "in_stock",
          leadTimeBusinessDays: 1,
        },
      });
      expect(result.estimatedPaybackMonths).toBe(expected);
      expect(result.estimatedFirstYearNetCad).toBe(
        benefit - hardware - monthly * 12,
      );
    },
  );
});
