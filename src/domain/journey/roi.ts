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
    avoidedRunoutCostCad +
    avoidedEmergencyCostCad +
    avoidedManualCheckCostCad;
  const estimatedFirstYearRolloutCostCad =
    fleetSize * (commerce.unitPriceCad + commerce.monthlyServiceCad * 12);

  return {
    avoidedRunoutCostCad: money(avoidedRunoutCostCad),
    avoidedEmergencyCostCad: money(avoidedEmergencyCostCad),
    avoidedManualCheckCostCad: money(avoidedManualCheckCostCad),
    estimatedAnnualBenefitCad: money(estimatedAnnualBenefitCad),
    estimatedFirstYearRolloutCostCad: money(
      estimatedFirstYearRolloutCostCad,
    ),
    estimatedFirstYearNetCad: money(
      estimatedAnnualBenefitCad - estimatedFirstYearRolloutCostCad,
    ),
    estimatedPaybackMonths:
      estimatedAnnualBenefitCad > 0
        ? money(
            (estimatedFirstYearRolloutCostCad / estimatedAnnualBenefitCad) * 12,
          )
        : null,
  };
}
