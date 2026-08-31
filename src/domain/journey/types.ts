import { z } from "zod";

export const orderStatuses = [
  "draft",
  "pending_approval",
  "approved",
  "changes_requested",
  "rejected",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const airFlameRequirementsSchema = z
  .object({
    companyName: z.string().trim().min(1).max(80),
    material: z.literal("heating_oil"),
    fleetSize: z.number().int().min(1).max(10_000),
    pilotQuantity: z.number().int().min(1).max(100),
    tankType: z.literal("above_ground_horizontal"),
    existingInstrumentation: z.literal("mechanical_float_gauge"),
    gaugeInterface: z.literal("confirmed_compatible"),
    connectivity: z.literal("lte_m"),
    siteDistribution: z.literal("distributed"),
    measurementPreference: z.literal("existing_float_gauge_interface"),
    readingFrequency: z.enum(["daily", "twice_daily", "weekly"]),
    lowLevelAlerts: z.boolean(),
    minimumTemperatureC: z.number().int().min(-60).max(50),
    maximumTemperatureC: z.number().int().min(-50).max(80),
    regulatedLocation: z.boolean(),
  })
  .strict()
  .refine((value) => value.minimumTemperatureC < value.maximumTemperatureC, {
    message: "The minimum temperature must be lower than the maximum.",
    path: ["minimumTemperatureC"],
  });

export type AirFlameRequirements = z.infer<typeof airFlameRequirementsSchema>;

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
};

export const defaultAirFlameRequirements: AirFlameRequirements = {
  companyName: "AirFlame Fuels",
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
