import type { Metadata } from "next";
import { CompatibilityAdvisor } from "@/components/compatibility-advisor";
import { FictionNotice } from "@/components/fiction-notice";
import { scenarioPresets } from "@/domain/compatibility/presets";
import { catalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Compatibility advisor",
  description:
    "Test deterministic compatibility rules and multilingual AI explanations against the fictional Tankroy Systems product catalog.",
};

type AdvisorPageProps = {
  searchParams: Promise<{ preset?: string | string[] }>;
};

export default async function AdvisorPage({ searchParams }: AdvisorPageProps) {
  const { preset } = await searchParams;
  const initialPresetId = typeof preset === "string" ? preset : undefined;

  return (
    <>
      <FictionNotice />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Compatibility laboratory
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Let AI explain a result it cannot override.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Confirm the structured requirements, inspect the deterministic
            result, and then ask questions in your preferred language. Provider
            fallback keeps the conversation available while compatibility
            remains under application control.
          </p>
        </div>
        <div className="mt-10">
          <CompatibilityAdvisor
            products={catalog.products}
            presets={scenarioPresets}
            initialPresetId={initialPresetId}
          />
        </div>
      </div>
    </>
  );
}
