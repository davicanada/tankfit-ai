import { scenarioPresets } from "@/domain/compatibility/presets";
import {
  defaultAirFlameRequirements,
  emptyRequirements,
  type AirFlameRequirements,
} from "./types";

// Explicitly fictional confirmed examples; no preset ID reaches the evaluator.
export const journeyPresets: AirFlameRequirements[] = [
  defaultAirFlameRequirements,
  {
    ...emptyRequirements,
    ...scenarioPresets[1].requirements,
    companyName: scenarioPresets[1].company,
    fleetSize: 20,
    pilotQuantity: 2,
    readingFrequency: "daily",
    lowLevelAlerts: true,
    minimumTemperatureC: -10,
    maximumTemperatureC: 35,
    clearSensorPath: true,
    foamOrObstructions: false,
  },
  {
    ...emptyRequirements,
    ...scenarioPresets[2].requirements,
    companyName: scenarioPresets[2].company,
    fleetSize: 20,
    pilotQuantity: 2,
    readingFrequency: "daily",
    lowLevelAlerts: true,
    minimumTemperatureC: 5,
    maximumTemperatureC: 35,
    cylinderFootprintConfirmed: true,
    gatewayCoverageConfirmed: true,
  },
] as AirFlameRequirements[];
