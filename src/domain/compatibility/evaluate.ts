import type { Product } from "@/lib/catalog";
import type {
  CompatibilityRequirements,
  CompatibilityResult,
  ProductMatch,
} from "./types";

export const COMPATIBILITY_RULE_VERSION = "2026.08.1";

const solutionProductTypes = new Set(["tank_monitor", "inventory_monitor"]);

function assessProduct(
  product: Product,
  requirements: CompatibilityRequirements,
): ProductMatch | null {
  if (!solutionProductTypes.has(product.productType)) return null;
  if (!product.supportedMaterials.includes(requirements.material)) return null;

  const matchedFields: string[] = [`material:${requirements.material}`];
  const reviewReasons: string[] = [];
  let score = 40;

  if (requirements.tankType === "unknown") {
    reviewReasons.push("tank_type_unknown");
  } else if (!product.supportedTankTypes.includes(requirements.tankType)) {
    return null;
  } else {
    matchedFields.push(`tank_type:${requirements.tankType}`);
    score += 25;
  }

  if (requirements.existingInstrumentation === "unknown") {
    reviewReasons.push("existing_instrumentation_unknown");
  } else if (
    product.existingInstrumentation.includes("none_required") ||
    product.existingInstrumentation.includes(requirements.existingInstrumentation)
  ) {
    matchedFields.push(
      `instrumentation:${requirements.existingInstrumentation}`,
    );
    score += 15;
  } else {
    return null;
  }

  if (requirements.connectivity === "unknown") {
    reviewReasons.push("connectivity_unknown");
  } else if (requirements.connectivity === "unavailable") {
    return null;
  } else if (!product.connectivity.includes(requirements.connectivity)) {
    return null;
  } else {
    matchedFields.push(`connectivity:${requirements.connectivity}`);
    score += 15;
  }

  if (
    requirements.measurementPreference !== "no_preference" &&
    requirements.measurementPreference !== "unknown"
  ) {
    if (product.measurementMethod !== requirements.measurementPreference) {
      return null;
    }
    matchedFields.push(
      `measurement_method:${requirements.measurementPreference}`,
    );
    score += 10;
  } else if (requirements.measurementPreference === "unknown") {
    reviewReasons.push("measurement_preference_unknown");
  }

  if (
    product.measurementMethod === "existing_float_gauge_interface" &&
    requirements.gaugeInterface !== "confirmed_compatible"
  ) {
    reviewReasons.push("gauge_interface_confirmation_required");
  }

  if (requirements.regulatedLocation === true) {
    reviewReasons.push("regulated_location_review_required");
  } else if (requirements.regulatedLocation === "unknown") {
    reviewReasons.push("regulated_location_status_unknown");
  } else {
    matchedFields.push("regulated_location:false");
    score += 5;
  }

  if (product.constraints.includes("technical_review_always_required")) {
    reviewReasons.push("product_requires_technical_review");
  }

  if (
    requirements.siteDistribution === "distributed" &&
    product.connectivity.includes("lte_m")
  ) {
    matchedFields.push("deployment:distributed_direct_cellular");
    score += 10;
  }

  if (
    requirements.siteDistribution === "clustered" &&
    product.constraints.includes("requires_compatible_gateway")
  ) {
    matchedFields.push("deployment:clustered_gateway_site");
    score += 10;
  }

  if (
    requirements.siteDistribution === "distributed" &&
    product.constraints.includes("requires_compatible_gateway")
  ) {
    score -= 20;
    reviewReasons.push("gateway_coverage_plan_required_for_distributed_sites");
  }

  return { product, score, matchedFields, reviewReasons };
}

export function evaluateCompatibility(
  products: Product[],
  requirements: CompatibilityRequirements,
): CompatibilityResult {
  if (requirements.material === "unsupported") {
    return {
      status: "out_of_scope",
      ruleVersion: COMPATIBILITY_RULE_VERSION,
      primaryRecommendation: null,
      alternatives: [],
      reasons: ["material_outside_supported_catalog"],
    };
  }

  const matches = products
    .map((product) => assessProduct(product, requirements))
    .filter((match): match is ProductMatch => match !== null)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.product.id.localeCompare(right.product.id),
    );

  if (matches.length === 0) {
    return {
      status: "technical_review_required",
      ruleVersion: COMPATIBILITY_RULE_VERSION,
      primaryRecommendation: null,
      alternatives: [],
      reasons: ["no_catalog_product_matches_all_confirmed_requirements"],
    };
  }

  const unknownInputReasons = Object.entries(requirements)
    .filter(([, value]) => value === "unknown")
    .map(([field]) => `${field}_unknown`);
  const allReviewReasons = [
    ...new Set([
      ...matches.flatMap((match) => match.reviewReasons),
      ...unknownInputReasons,
    ]),
  ];
  const needsReview = allReviewReasons.length > 0;

  return {
    status: needsReview ? "technical_review_required" : "compatible",
    ruleVersion: COMPATIBILITY_RULE_VERSION,
    primaryRecommendation: matches[0],
    alternatives: matches.slice(1, 3),
    reasons: needsReview ? allReviewReasons : ["all_compatibility_fields_confirmed"],
  };
}
