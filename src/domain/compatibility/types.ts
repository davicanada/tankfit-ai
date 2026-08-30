import type { Product } from "@/lib/catalog";

export const supportedMaterials = [
  "propane",
  "heating_oil",
  "refined_fuels",
  "lubricants",
  "water",
  "industrial_gases",
] as const;

export type SupportedMaterial = (typeof supportedMaterials)[number];

export type CompatibilityRequirements = {
  material: SupportedMaterial | "unsupported";
  tankType: string | "unknown";
  existingInstrumentation: string | "unknown";
  gaugeInterface: "confirmed_compatible" | "not_applicable" | "unknown";
  connectivity: "lte_m" | "bluetooth_le" | "ethernet" | "unavailable" | "unknown";
  siteDistribution: "distributed" | "clustered" | "single_site" | "unknown";
  measurementPreference: string | "no_preference" | "unknown";
  regulatedLocation: boolean | "unknown";
};

export type CompatibilityStatus =
  | "compatible"
  | "technical_review_required"
  | "out_of_scope";

export type ProductMatch = {
  product: Product;
  score: number;
  matchedFields: string[];
  reviewReasons: string[];
};

export type CompatibilityResult = {
  status: CompatibilityStatus;
  ruleVersion: string;
  primaryRecommendation: ProductMatch | null;
  alternatives: ProductMatch[];
  reasons: string[];
};
