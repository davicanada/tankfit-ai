import type { CompatibilityResult } from "@/domain/compatibility/types";

function productSummary(result: CompatibilityResult) {
  const recommendation = result.primaryRecommendation;
  if (!recommendation) return null;

  const evidence = recommendation.matchedFields
    .map((field) => field.replaceAll("_", " ").replace(":", ": "))
    .join(", ");

  return `${recommendation.product.name} (${recommendation.product.id}) is the strongest catalog match. Confirmed evidence: ${evidence}.`;
}

export function createDeterministicAdvisorResponse(
  result: CompatibilityResult,
) {
  if (result.status === "out_of_scope") {
    return "This request is outside the fictional catalog currently supported by TankFit AI. The guided advisor supports propane, heating oil, refined fuels, lubricants, water, and industrial gases. No product recommendation was created.";
  }

  const summary = productSummary(result);

  if (result.status === "technical_review_required") {
    return summary
      ? `${summary} A technical review is still required because one or more inputs are unknown or the selected application has a mandatory review constraint. Please confirm the highlighted structured requirements before relying on this demo recommendation.`
      : "No fictional catalog product safely matches all confirmed requirements. A technical review is required; TankFit AI will not invent a compatible product. Review the structured requirements or choose a supported application.";
  }

  const alternatives = result.alternatives
    .map(({ product }) => `${product.name} (${product.id})`)
    .join(" and ");

  return `${summary} ${
    alternatives ? `Compatible alternatives are ${alternatives}. ` : ""
  }This deterministic response uses catalog version 2026.08.1 and compatibility rule version ${result.ruleVersion}. All products and information are fictional.`;
}
