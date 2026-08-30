import "server-only";
import { providerIds, type ProviderId } from "./types";

export const defaultProviderModels: Record<ProviderId, string> = {
  gemini: "gemini-3.7-flash",
  cerebras: "gpt-oss-120b",
  groq: "Qwen/Qwen3.6-27B",
  openrouter: "openrouter/free",
};

const providerEnvironmentKeys: Record<ProviderId, string> = {
  gemini: "GEMINI_API_KEY",
  cerebras: "CEREBRAS_API_KEY",
  groq: "GROQ_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
};

const modelEnvironmentKeys: Record<ProviderId, string> = {
  gemini: "GEMINI_MODEL",
  cerebras: "CEREBRAS_MODEL",
  groq: "GROQ_MODEL",
  openrouter: "OPENROUTER_MODEL",
};

function parseProviderOrder(value: string | undefined): ProviderId[] {
  if (!value) return [...providerIds];

  const requested = value
    .split(",")
    .map((provider) => provider.trim().toLowerCase())
    .filter((provider): provider is ProviderId =>
      providerIds.includes(provider as ProviderId),
    );

  return [...new Set(requested)];
}

function parseBoundedInteger(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : fallback;
}

export type ProviderConfiguration = {
  id: ProviderId;
  apiKey: string | null;
  model: string;
};

export function getAiConfiguration() {
  const order = parseProviderOrder(process.env.AI_PROVIDER_ORDER);
  const providers = order.map(
    (id): ProviderConfiguration => ({
      id,
      apiKey: process.env[providerEnvironmentKeys[id]]?.trim() || null,
      model:
        process.env[modelEnvironmentKeys[id]]?.trim() ||
        defaultProviderModels[id],
    }),
  );

  return {
    providers,
    timeoutMs: parseBoundedInteger(
      process.env.AI_PROVIDER_TIMEOUT_MS,
      7_000,
      2_000,
      15_000,
    ),
    maxOutputTokens: parseBoundedInteger(
      process.env.AI_MAX_OUTPUT_TOKENS,
      420,
      128,
      800,
    ),
  };
}
