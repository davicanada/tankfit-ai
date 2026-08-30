import type { CompatibilityRequirements } from "./types";

export type ScenarioPreset = {
  id: string;
  company: string;
  title: string;
  description: string;
  logoPath: string;
  requirements: CompatibilityRequirements;
};

export const scenarioPresets: ScenarioPreset[] = [
  {
    id: "airflame",
    company: "AirFlame Fuels",
    title: "Distributed heating-oil pilot",
    description:
      "Five above-ground tanks with compatible float gauges across rural sites.",
    logoPath: "/images/logos/airflame-fuels.svg",
    requirements: {
      material: "heating_oil",
      tankType: "above_ground_horizontal",
      existingInstrumentation: "mechanical_float_gauge",
      gaugeInterface: "confirmed_compatible",
      connectivity: "lte_m",
      siteDistribution: "distributed",
      measurementPreference: "existing_float_gauge_interface",
      regulatedLocation: false,
    },
  },
  {
    id: "agricuflow",
    company: "AgricuFlow Cooperative",
    title: "Remote water storage",
    description:
      "Above-ground water tanks that need non-contact monitoring and cellular alerts.",
    logoPath: "/images/logos/agricuflow-cooperative.svg",
    requirements: {
      material: "water",
      tankType: "above_ground_vertical",
      existingInstrumentation: "none_required",
      gaugeInterface: "not_applicable",
      connectivity: "lte_m",
      siteDistribution: "distributed",
      measurementPreference: "non_contact_radar",
      regulatedLocation: false,
    },
  },
  {
    id: "boreal",
    company: "Boreal Beverage Group",
    title: "Industrial-gas cylinder bank",
    description:
      "A clustered cylinder bank monitored by weight through a shared gateway.",
    logoPath: "/images/logos/boreal-beverage-group.svg",
    requirements: {
      material: "industrial_gases",
      tankType: "upright_cylinder_bank",
      existingInstrumentation: "none_required",
      gaugeInterface: "not_applicable",
      connectivity: "bluetooth_le",
      siteDistribution: "clustered",
      measurementPreference: "load_cell_weight",
      regulatedLocation: false,
    },
  },
];
