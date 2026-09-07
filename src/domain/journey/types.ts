import { z } from "zod";
import { supportedMaterials } from "@/domain/compatibility/types";
import { getCompany } from "@/lib/companies";

export const tankTypes = [
  "above_ground_horizontal",
  "above_ground_vertical",
  "open_top_process_tank",
  "underground_vented",
  "above_ground_pressurized_horizontal",
  "above_ground_pressurized_vertical",
  "upright_cylinder",
  "upright_cylinder_bank",
  "unknown",
] as const;
export const instrumentationTypes = [
  "mechanical_float_gauge",
  "supported_remote_ready_propane_gauge",
  "none_required",
  "unknown",
] as const;
export const measurementMethods = [
  "existing_float_gauge_interface",
  "existing_propane_gauge_interface",
  "non_contact_radar",
  "hydrostatic_pressure",
  "load_cell_weight",
  "no_preference",
  "unknown",
] as const;

export const orderStatuses = [
  "draft",
  "pending_approval",
  "approved",
  "changes_requested",
  "rejected",
  "accepted",
  "paid",
  "superseded",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const airFlameRequirementsSchema = z
  .object({
    companyName: z.string().trim().min(1).max(80),
    material: z.enum([...supportedMaterials, "unsupported", "unknown"]),
    fleetSize: z.number().int().min(1).max(10_000),
    pilotQuantity: z.number().int().min(1).max(100),
    tankType: z.enum(tankTypes),
    existingInstrumentation: z.enum(instrumentationTypes),
    gaugeInterface: z.enum([
      "confirmed_compatible",
      "not_applicable",
      "unknown",
    ]),
    connectivity: z.enum([
      "lte_m",
      "bluetooth_le",
      "ethernet",
      "unavailable",
      "unknown",
    ]),
    siteDistribution: z.enum([
      "distributed",
      "clustered",
      "single_site",
      "unknown",
    ]),
    measurementPreference: z.enum(measurementMethods),
    readingFrequency: z.enum(["daily", "twice_daily", "weekly", "unknown"]),
    lowLevelAlerts: z.union([z.boolean(), z.literal("unknown")]),
    minimumTemperatureC: z.number().min(-100).max(100).nullable(),
    maximumTemperatureC: z.number().min(-100).max(150).nullable(),
    regulatedLocation: z.union([z.boolean(), z.literal("unknown")]),
    clearSensorPath: z
      .union([z.boolean(), z.literal("unknown")])
      .default("unknown"),
    foamOrObstructions: z
      .union([z.boolean(), z.literal("unknown")])
      .default("unknown"),
    cylinderFootprintConfirmed: z
      .union([z.boolean(), z.literal("unknown")])
      .default("unknown"),
    shelteredInstallation: z
      .union([z.boolean(), z.literal("unknown")])
      .default("unknown"),
    gatewayCoverageConfirmed: z
      .union([z.boolean(), z.literal("unknown")])
      .default("unknown"),
    wettedMaterialCompatible: z
      .union([z.boolean(), z.literal("unknown")])
      .default("unknown"),
  })
  .strict()
  .refine(
    (value) =>
      value.minimumTemperatureC === null ||
      value.maximumTemperatureC === null ||
      value.minimumTemperatureC < value.maximumTemperatureC,
    {
      message: "The minimum temperature must be lower than the maximum.",
      path: ["minimumTemperatureC"],
    },
  );

export type AirFlameRequirements = z.infer<typeof airFlameRequirementsSchema>;
export type SolutionSnapshot = {
  businessBrief?: BusinessBrief;
  requirements: AirFlameRequirements;
  roiAssumptions: RoiAssumptions;
  roi: RoiResult;
  catalogVersion: string;
  ruleVersion: string;
  productName: string;
  reasons: string[];
};

export const roiAssumptionsSchema = z
  .object({
    annualRunouts: z.number().int().min(0).max(10_000),
    costPerRunoutCad: z.number().min(0).max(1_000_000),
    runoutReductionPercent: z.number().min(0).max(100),
    annualEmergencyDeliveries: z.number().int().min(0).max(100_000),
    incrementalEmergencyCostCad: z.number().min(0).max(1_000_000),
    emergencyReductionPercent: z.number().min(0).max(100),
    annualManualChecks: z.number().int().min(0).max(1_000_000),
    costPerManualCheckCad: z.number().min(0).max(100_000),
    manualCheckReductionPercent: z.number().min(0).max(100),
  })
  .strict();

export type RoiAssumptions = z.infer<typeof roiAssumptionsSchema>;

export type RoiResult = {
  avoidedRunoutCostCad: number;
  avoidedEmergencyCostCad: number;
  avoidedManualCheckCostCad: number;
  estimatedAnnualBenefitCad: number;
  estimatedFirstYearRolloutCostCad: number;
  estimatedFirstYearNetCad: number;
  estimatedPaybackMonths: number | null;
};

export type CommerceSnapshot = {
  productId: string;
  commerceVersion: string;
  currency: "CAD";
  unitPriceCad: number;
  monthlyServiceCad: number;
  stockQuantity: number;
  availability: "in_stock" | "limited" | "unavailable";
  leadTimeBusinessDays: number;
};

export type JourneyView = {
  salesRequested: boolean;
  businessBrief: BusinessBrief;
  revisions: {
    id: string;
    revision: number;
    status: string;
    decisionNote: string | null;
  }[];
  sessionId: string;
  expiresAt: string;
  requirements: AirFlameRequirements;
  requirementsConfirmed: boolean;
  recommendation: {
    status: "compatible" | "technical_review_required" | "out_of_scope";
    ruleVersion: string;
    productId: string | null;
    productName: string | null;
    reasons: string[];
  } | null;
  commerce: CommerceSnapshot | null;
  roiAssumptions: RoiAssumptions;
  roi: RoiResult | null;
  order: {
    workflowVersion: number;
    revision: number;
    id: string;
    status: OrderStatus;
    quantity: number;
    hardwareSubtotalCad: number;
    monthlyServiceCad: number;
    fictionalDepositCad: number;
    decisionNote: string | null;
    updatedAt: string;
  } | null;
  staffMode: boolean;
  proposalId: string | null;
  conversation: { role: "user" | "assistant"; content: string }[];
  events: {
    id: string;
    eventType: string;
    actor: string;
    createdAt: string;
    metadata: Record<string, unknown>;
  }[];
};

export const businessBriefSchema = z
  .object({
    objective: z.string().trim().max(500),
    timeline: z.string().trim().max(200),
    successCriteria: z.string().trim().max(500),
  })
  .strict();
export type BusinessBrief = z.infer<typeof businessBriefSchema>;
export const emptyBusinessBrief: BusinessBrief = {
  objective: "",
  timeline: "",
  successCriteria: "",
};

export const defaultAirFlameRequirements: AirFlameRequirements = {
  companyName: getCompany("airflame-fuels").name,
  material: "heating_oil",
  fleetSize: 500,
  pilotQuantity: 5,
  tankType: "above_ground_horizontal",
  existingInstrumentation: "mechanical_float_gauge",
  gaugeInterface: "confirmed_compatible",
  connectivity: "lte_m",
  siteDistribution: "distributed",
  measurementPreference: "existing_float_gauge_interface",
  readingFrequency: "daily",
  lowLevelAlerts: true,
  minimumTemperatureC: -25,
  maximumTemperatureC: 35,
  regulatedLocation: false,
  clearSensorPath: "unknown",
  foamOrObstructions: "unknown",
  cylinderFootprintConfirmed: "unknown",
  shelteredInstallation: "unknown",
  gatewayCoverageConfirmed: "unknown",
  wettedMaterialCompatible: "unknown",
};

export const defaultRoiAssumptions: RoiAssumptions = {
  annualRunouts: 24,
  costPerRunoutCad: 320,
  runoutReductionPercent: 60,
  annualEmergencyDeliveries: 60,
  incrementalEmergencyCostCad: 140,
  emergencyReductionPercent: 50,
  annualManualChecks: 1_200,
  costPerManualCheckCad: 18,
  manualCheckReductionPercent: 70,
};

export const emptyRequirements: AirFlameRequirements = {
  companyName: "My fictional organization",
  fleetSize: 1,
  pilotQuantity: 1,
  material: "unknown",
  tankType: "unknown",
  existingInstrumentation: "unknown",
  gaugeInterface: "unknown",
  connectivity: "unknown",
  siteDistribution: "unknown",
  measurementPreference: "unknown",
  readingFrequency: "unknown",
  lowLevelAlerts: "unknown",
  minimumTemperatureC: null,
  maximumTemperatureC: null,
  regulatedLocation: "unknown",
  clearSensorPath: "unknown",
  foamOrObstructions: "unknown",
  cylinderFootprintConfirmed: "unknown",
  shelteredInstallation: "unknown",
  gatewayCoverageConfirmed: "unknown",
  wettedMaterialCompatible: "unknown",
};
