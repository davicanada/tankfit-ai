import type { CompatibilityResult } from "@/domain/compatibility/types";
import { catalog, getOperatingProfile } from "@/lib/catalog";
import type { AdvisorConversationContext } from "./conversation-context";

function unique(values: string[]) {
  return [...new Set(values)];
}

function catalogOverview() {
  const families = unique(catalog.products.map((product) => product.family));
  return `The fictional Tankroy catalog includes tank and cylinder monitors, site gateways, a solar power accessory, and a local status display. The product families are ${families.join(", ")}. Tell me what you store or monitor, and I can explain the most relevant family.`;
}

function frequencyAnswer(includeQuestion = true) {
  const frequencies = unique(
    catalog.products.flatMap((product) => {
      const profile = getOperatingProfile(product.id);
      return profile?.readingFrequencies ?? [];
    }),
  );
  const readable = frequencies.map((frequency) =>
    frequency === "twice_daily"
      ? "twice daily"
      : frequency.replaceAll("_", " "),
  );
  return `The fictional monitoring products with an operating profile support scheduled readings ${readable.join(", ")}. The exact options depend on the monitor.${includeQuestion ? " Which product or stored material would you like to check?" : ""}`;
}

function connectivityAnswer(requiresSatellite = false) {
  const options =
    "The fictional catalog uses cellular LTE-M for direct remote connections, Bluetooth Low Energy for monitors connected through a local gateway, and Ethernet on selected gateways.";
  return requiresSatellite
    ? `${options} It does not support satellite connectivity. Would cellular LTE-M be acceptable for this scenario?`
    : `${options} Which connection can your fictional site use?`;
}

function nextDiscoveryQuestion(context: AdvisorConversationContext) {
  const requirements = context.requirements;
  if (requirements.material === "unknown") {
    return "What material is stored in the tank or cylinder?";
  }
  if (requirements.tankType === "unknown") {
    return "What kind of tank is it—for example, above-ground horizontal, vertical, underground and vented, or a gas cylinder?";
  }
  if (requirements.existingInstrumentation === "unknown") {
    return "Does the tank already have a gauge or other level instrument?";
  }
  if (requirements.connectivity === "unknown") {
    return "What connection is available at the site: cellular, local Bluetooth through a gateway, or Ethernet?";
  }
  if (
    requirements.minimumTemperatureC === null ||
    requirements.maximumTemperatureC === null
  ) {
    return "What approximate temperature range should the fictional equipment handle?";
  }
  return null;
}

function recommendationSummary(result: CompatibilityResult) {
  const recommendation = result.primaryRecommendation;
  if (!recommendation) return null;
  return `${recommendation.product.name} is the strongest catalog match for the details confirmed so far.`;
}

export function createDeterministicAdvisorResponse(
  result: CompatibilityResult,
  context: AdvisorConversationContext,
) {
  const requiresSatellite = context.unsupportedConstraints.includes(
    "satellite_connectivity",
  );

  if (context.intent === "catalog_overview") {
    return requiresSatellite
      ? `${catalogOverview()} Satellite connectivity is not available. Would cellular LTE-M be acceptable for this scenario?`
      : catalogOverview();
  }

  if (context.intent === "product_question") {
    if (context.topic === "reading_frequency") {
      return requiresSatellite
        ? `${frequencyAnswer(false)} The catalog does not support satellite connectivity. Would cellular LTE-M be acceptable for this scenario?`
        : frequencyAnswer();
    }
    if (context.topic === "connectivity") {
      return connectivityAnswer(requiresSatellite);
    }
  }

  if (requiresSatellite) {
    return "The fictional Tankroy catalog does not support satellite connectivity. The available remote options are cellular LTE-M or Bluetooth through a local gateway, with Ethernet on selected gateways. Would cellular coverage be acceptable for this scenario?";
  }

  if (result.status === "out_of_scope") {
    return "That application is outside the fictional catalog currently supported by TankFit AI. The guided advisor covers propane, heating oil, refined fuels, lubricants, water, and industrial gases, so I cannot recommend a product for this request.";
  }

  const summary = recommendationSummary(result);
  const question = nextDiscoveryQuestion(context);

  if (result.status === "technical_review_required") {
    const explanation = summary
      ? `${summary} Some information still needs confirmation before it can be treated as a suitable solution.`
      : "I do not yet have enough confirmed information to identify a suitable fictional product.";
    return question
      ? `${explanation} ${question}`
      : `${explanation} A qualified technical review is still required.`;
  }

  const alternatives = result.alternatives
    .map(({ product }) => product.name)
    .join(" and ");
  return `${summary}${
    alternatives ? ` Compatible alternatives are ${alternatives}.` : ""
  } Review the extracted facts before continuing with the fictional customer journey.`;
}
