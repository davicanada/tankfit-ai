import type { CompatibilityRequirements } from "./types";
import { getCompany } from "@/lib/companies";

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
    company: getCompany("airflame-fuels").name,
    title: "Distributed heating-oil pilot",
    description:
      "Five above-ground tanks with compatible float gauges across rural sites.",
    logoPath: getCompany("airflame-fuels").logoPath,
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
    company: getCompany("agricuflow-cooperative").name,
    title: "Remote water storage",
    description:
      "Above-ground water tanks that need non-contact monitoring and cellular alerts.",
    logoPath: getCompany("agricuflow-cooperative").logoPath,
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
    company: getCompany("boreal-beverage-group").name,
    title: "Industrial-gas cylinder bank",
    description:
      "A clustered cylinder bank monitored by weight through a shared gateway.",
    logoPath: getCompany("boreal-beverage-group").logoPath,
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
