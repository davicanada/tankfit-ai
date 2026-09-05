import profiles from "../../../data/catalog/operating-profiles.json";
import { evaluateCompatibility } from "@/domain/compatibility/evaluate";
import { catalog } from "@/lib/catalog";
import type { AirFlameRequirements } from "./types";

export function evaluateJourney(requirements: AirFlameRequirements) {
  const result = evaluateCompatibility(catalog.products, {
    material: requirements.material,
    tankType: requirements.tankType,
    existingInstrumentation: requirements.existingInstrumentation,
    gaugeInterface: requirements.gaugeInterface,
    connectivity: requirements.connectivity,
    siteDistribution: requirements.siteDistribution,
    measurementPreference: requirements.measurementPreference,
    regulatedLocation: requirements.regulatedLocation,
  });
  // Only the primary candidate passes this operating-profile validation.
  // Do not expose base-only alternatives as qualified transactional matches.
  result.alternatives = [];
  result.ruleVersion = `${result.ruleVersion}/operating-${profiles.version}`;
  if (result.status !== "compatible") return result;
  const id = result.primaryRecommendation?.product.id;
  const profile = id
    ? profiles.profiles[id as keyof typeof profiles.profiles]
    : undefined;
  const reasons: string[] = [];
  const constraints = result.primaryRecommendation?.product.constraints ?? [];
  if (
    constraints.includes("requires_clear_sensor_path") &&
    requirements.clearSensorPath !== true
  )
    reasons.push("clear_sensor_path_confirmation_required");
  if (
    constraints.includes(
      "technical_review_for_foam_or_internal_obstructions",
    ) &&
    requirements.foamOrObstructions !== false
  )
    reasons.push("foam_and_obstructions_review_required");
  if (
    constraints.includes("requires_supported_cylinder_footprint") &&
    requirements.cylinderFootprintConfirmed !== true
  )
    reasons.push("cylinder_footprint_confirmation_required");
  if (
    constraints.includes("indoor_or_sheltered_use") &&
    requirements.shelteredInstallation !== true
  )
    reasons.push("sheltered_installation_confirmation_required");
  if (
    constraints.includes("requires_compatible_gateway") &&
    requirements.gatewayCoverageConfirmed !== true
  )
    reasons.push("gateway_coverage_confirmation_required");
  if (
    constraints.includes("requires_material_compatibility_review") &&
    requirements.wettedMaterialCompatible !== true
  )
    reasons.push("wetted_material_review_required");
  if (!profile) reasons.push("operating_profile_requires_technical_review");
  if (
    requirements.minimumTemperatureC === null ||
    requirements.maximumTemperatureC === null
  )
    reasons.push("operating_temperature_unknown");
  else if (
    profile &&
    (requirements.minimumTemperatureC < profile.minimumTemperatureC ||
      requirements.maximumTemperatureC > profile.maximumTemperatureC)
  )
    reasons.push("operating_temperature_outside_synthetic_profile");
  if (requirements.readingFrequency === "unknown")
    reasons.push("reading_frequency_unknown");
  else if (
    profile &&
    !profile.readingFrequencies.includes(requirements.readingFrequency)
  )
    reasons.push("reading_frequency_not_supported");
  if (requirements.lowLevelAlerts === "unknown")
    reasons.push("alert_requirements_unknown");
  else if (requirements.lowLevelAlerts && profile && !profile.lowLevelAlerts)
    reasons.push("low_level_alerts_not_supported");
  if (reasons.length)
    return { ...result, status: "technical_review_required" as const, reasons };
  return result;
}
