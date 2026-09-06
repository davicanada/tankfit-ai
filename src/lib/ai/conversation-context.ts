import type { AirFlameRequirements } from "@/domain/journey/types";
import type { AdvisorMessage } from "./types";

export type AdvisorIntent =
  | "catalog_overview"
  | "product_question"
  | "solution_discovery";

export type AdvisorTopic = "connectivity" | "reading_frequency" | null;
export type UnsupportedConstraint = "satellite_connectivity";

export type AdvisorConversationContext = {
  intent: AdvisorIntent;
  topic: AdvisorTopic;
  unsupportedConstraints: UnsupportedConstraint[];
  technicalTraceRequested: boolean;
  requirements: AirFlameRequirements;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesAny(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function findLastMention(value: string, patterns: RegExp[]) {
  let latest = -1;
  for (const pattern of patterns) {
    const globalPattern = new RegExp(
      pattern.source,
      pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`,
    );
    for (const match of value.matchAll(globalPattern)) {
      latest = Math.max(latest, match.index);
    }
  }
  return latest;
}

function classifyTopic(message: string): AdvisorTopic {
  if (
    includesAny(message, [
      /\b(frequenc\w*|cadence|interval|how often)\b/,
      /\b(reading|readings|leitura|leituras|lectura|lecturas|releve|releves)\b/,
      /frequenz|czestotliw|频率|आवृत्ति/,
    ])
  ) {
    return "reading_frequency";
  }

  if (
    includesAny(message, [
      /\b(connectiv|conectiv|connexion|verbindung|lacznosc)\w*/,
      /\b(lte(?:-?m)?|cellular|celular|bluetooth|ethernet|satellite|satelite)\b/,
      /卫星|连接|उपग्रह|कनेक्टिविटी/,
    ])
  ) {
    return "connectivity";
  }

  return null;
}

export function classifyAdvisorIntent(message: string): {
  intent: AdvisorIntent;
  topic: AdvisorTopic;
} {
  const normalized = normalize(message);
  const topic = classifyTopic(normalized);

  const asksForRecommendation = includesAny(normalized, [
    /\b(recommend|recommendation|best fit|help me choose|which should i)\b/,
    /\b(recomend|suger|indic|qual devo|melhor opcao|ajude.{0,20}escolh)\w*/,
    /\b(recommand|consigli|empfehl|polec)\w*/,
    /推荐|建议|सुझा/,
  ]);

  const asksForCatalogOverview = includesAny(normalized, [
    /\b(what|which)\s+(?:kind(?:s)?\s+of\s+)?products?\b/,
    /\bwhat do (?:you|they) sell\b/,
    /\bproduct catalog(?:ue)?\b/,
    /\b(quais|que) produtos?(?: voces?)?(?: vendem| oferecem)?\b/,
    /\bo que voces (?:vendem|oferecem)\b/,
    /\bcatalogo de produtos\b/,
    /\bque productos?(?: venden| ofrecen)?\b/,
    /\bquels produits|que vendez-vous|catalogue de produits\b/,
    /\bquali prodotti|cosa vendete|catalogo prodotti\b/,
    /\bwelche produkte|was verkaufen sie|produktkatalog\b/,
    /\bjakie produkty|co sprzedajecie|katalog produktow\b/,
    /哪些产品|卖什么|产品目录|कौन से उत्पाद|क्या बेचते/,
  ]);

  if (asksForCatalogOverview && !asksForRecommendation) {
    return { intent: "catalog_overview", topic: null };
  }

  if (
    topic ||
    includesAny(normalized, [
      /\b(product|produto|producto|produit|prodotto|produkt|model|modelo|device|dispositivo)\w*/,
      /\b(floatlink|radarsight|pressurelink|hydrosense|gasweight|connecthub|solarrelay|sitedisplay)\b/,
    ])
  ) {
    return asksForRecommendation
      ? { intent: "solution_discovery", topic }
      : { intent: "product_question", topic };
  }

  return { intent: "solution_discovery", topic };
}

function findUnsupportedConstraints(messages: AdvisorMessage[]) {
  const visitorText = normalize(
    messages
      .filter((message) => message.role === "user")
      .map((message) => message.content)
      .join("\n"),
  );
  const lastSatellite = findLastMention(visitorText, [
    /\bsatellite\b/,
    /\bsatelite\b/,
    /\bsatelital\b/,
    /\bsatellit\w*/,
    /卫星/,
    /उपग्रह/,
  ]);
  const lastSupportedAlternative = findLastMention(visitorText, [
    /\blte(?:-?m)?\b/,
    /\bcellular\b/,
    /\bcelular\b/,
    /\bbluetooth\b/,
    /\bethernet\b/,
  ]);

  return lastSatellite >= 0 && lastSatellite > lastSupportedAlternative
    ? (["satellite_connectivity"] satisfies UnsupportedConstraint[])
    : [];
}

export function buildAdvisorConversationContext(input: {
  messages: AdvisorMessage[];
  requirements: AirFlameRequirements;
}): AdvisorConversationContext {
  const finalVisitorMessage =
    [...input.messages]
      .reverse()
      .find((message) => message.role === "user")?.content ?? "";
  const { intent, topic } = classifyAdvisorIntent(finalVisitorMessage);

  return {
    intent,
    topic,
    unsupportedConstraints: findUnsupportedConstraints(input.messages),
    technicalTraceRequested: includesAny(normalize(finalVisitorMessage), [
      /\b(rule version|catalog version|product id|technical trace)\b/,
      /\b(versao da regra|versao do catalogo|id do produto|rastreabilidade tecnica)\b/,
    ]),
    requirements: input.requirements,
  };
}

export function boundAdvisorAnswer(
  answer: string,
  maximum = 1_200,
  technicalTraceRequested = false,
) {
  let trimmed = answer.trim();
  if (!technicalTraceRequested) {
    trimmed = trimmed
      .replace(/\btechnical_review_required\b/gi, "technical review is required")
      .replace(/\bout_of_scope\b/gi, "outside the supported catalog")
      .replace(/\blte_m\b/gi, "LTE-M")
      .replace(/\bbluetooth_le\b/gi, "Bluetooth Low Energy")
      .replace(/\babove_ground_pressurized_horizontal\b/gi, "above-ground horizontal pressurized tank")
      .replace(/\babove_ground_pressurized_vertical\b/gi, "above-ground vertical pressurized tank")
      .replace(/\s*\((?:ID:\s*)?TR-[A-Z0-9-]+\)/gi, "")
      .replace(/\bID:\s*TR-[A-Z0-9-]+\b/gi, "")
      .replace(
        /\s*\(?\s*(?:(?:rule|catalog|operating)\s+version|vers(?:a|ã)o(?:\s+da\s+regra)?)\s*:?\s*20\d{2}\.\d{2}\.\d+(?:\/operating-20\d{2}\.\d{2}\.\d+)?\s*\)?/gi,
        "",
      )
      .replace(/\b[a-z]+(?:_[a-z0-9]+)+\b/gi, (value) =>
        value.replaceAll("_", " "),
      )
      .trim();
  }

  const firstQuestion = trimmed.indexOf("?");
  if (firstQuestion >= 0 && trimmed.indexOf("?", firstQuestion + 1) >= 0) {
    trimmed = trimmed.slice(0, firstQuestion + 1);
  }
  if (trimmed.length <= maximum) return trimmed;

  const candidate = trimmed.slice(0, maximum - 1);
  const sentenceEnd = Math.max(
    candidate.lastIndexOf(". "),
    candidate.lastIndexOf("? "),
    candidate.lastIndexOf("! "),
    candidate.lastIndexOf("\n"),
  );
  const wordEnd = candidate.lastIndexOf(" ");
  const boundary = sentenceEnd >= Math.floor(maximum * 0.55)
    ? sentenceEnd + 1
    : wordEnd;

  return `${candidate.slice(0, Math.max(1, boundary)).trimEnd()}…`;
}
