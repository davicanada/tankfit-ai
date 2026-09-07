import type { CommerceSnapshot, RoiAssumptions, RoiResult } from "./types";

function money(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateRoi(input: {
  fleetSize: number;
  assumptions: RoiAssumptions;
  commerce: CommerceSnapshot;
}): RoiResult {
  const { assumptions, commerce, fleetSize } = input;
  const avoidedRunoutCostCad =
    assumptions.annualRunouts *
    assumptions.costPerRunoutCad *
    (assumptions.runoutReductionPercent / 100);
  const avoidedEmergencyCostCad =
    assumptions.annualEmergencyDeliveries *
    assumptions.incrementalEmergencyCostCad *
    (assumptions.emergencyReductionPercent / 100);
  const avoidedManualCheckCostCad =
    assumptions.annualManualChecks *
    assumptions.costPerManualCheckCad *
    (assumptions.manualCheckReductionPercent / 100);
  const estimatedAnnualBenefitCad =
    avoidedRunoutCostCad + avoidedEmergencyCostCad + avoidedManualCheckCostCad;
  const estimatedFirstYearRolloutCostCad =
    fleetSize * (commerce.unitPriceCad + commerce.monthlyServiceCad * 12);
  const annualServiceCostCad = fleetSize * commerce.monthlyServiceCad * 12;
  const annualNetBenefitCad = estimatedAnnualBenefitCad - annualServiceCostCad;

  return {
    avoidedRunoutCostCad: money(avoidedRunoutCostCad),
    avoidedEmergencyCostCad: money(avoidedEmergencyCostCad),
    avoidedManualCheckCostCad: money(avoidedManualCheckCostCad),
    estimatedAnnualBenefitCad: money(estimatedAnnualBenefitCad),
    estimatedFirstYearRolloutCostCad: money(estimatedFirstYearRolloutCostCad),
    estimatedFirstYearNetCad: money(
      estimatedAnnualBenefitCad - estimatedFirstYearRolloutCostCad,
    ),
    estimatedPaybackMonths:
      annualNetBenefitCad > 0
        ? money(
            ((fleetSize * commerce.unitPriceCad) / annualNetBenefitCad) * 12,
          )
        : null,
  };
}
