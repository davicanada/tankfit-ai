import { z } from "zod";
import { supportedMaterials } from "@/domain/compatibility/types";

export const advisorMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(1_200),
  })
  .strict();

export const compatibilityRequirementsSchema = z
  .object({
    material: z.enum([...supportedMaterials, "unsupported"]),
    tankType: z.string().trim().min(1).max(80),
    existingInstrumentation: z.string().trim().min(1).max(80),
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
    measurementPreference: z.string().trim().min(1).max(80),
    regulatedLocation: z.union([z.boolean(), z.literal("unknown")]),
  })
  .strict();

export const advisorRequestSchema = z
  .object({
    messages: z.array(advisorMessageSchema).min(1).max(12),
    requirements: compatibilityRequirementsSchema,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.messages.at(-1)?.role !== "user") {
      context.addIssue({
        code: "custom",
        message: "The final message must be from the visitor.",
        path: ["messages"],
      });
    }

    const totalCharacters = value.messages.reduce(
      (total, message) => total + message.content.length,
      0,
    );
    if (totalCharacters > 6_000) {
      context.addIssue({
        code: "too_big",
        maximum: 6_000,
        origin: "string",
        message: "Conversation history is too long.",
        path: ["messages"],
      });
    }
  });

export type AdvisorMessage = z.infer<typeof advisorMessageSchema>;
export type AdvisorRequest = z.infer<typeof advisorRequestSchema>;

export const providerIds = [
  "gemini",
  "cerebras",
  "groq",
  "openrouter",
] as const;

export type ProviderId = (typeof providerIds)[number];
export type ProviderAttemptOutcome =
  | "success"
  | "failed"
  | "not_configured"
  | "circuit_open";

export type ProviderErrorCategory =
  | "timeout"
  | "rate_limit"
  | "billing"
  | "authentication"
  | "invalid_response"
  | "provider_error";

export type ProviderAttempt = {
  provider: ProviderId;
  model: string;
  outcome: ProviderAttemptOutcome;
  latencyMs: number;
  errorCategory?: ProviderErrorCategory;
};

export type AdvisorReply = {
  answer: string;
  mode: "ai" | "deterministic";
  provider: ProviderId | null;
  model: string | null;
  attempts: ProviderAttempt[];
  compatibility: {
    status: "compatible" | "technical_review_required" | "out_of_scope";
    ruleVersion: string;
    primaryProductId: string | null;
  };
};
