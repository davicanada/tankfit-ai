"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvisorChat } from "@/components/advisor-chat";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { evaluateCompatibility } from "@/domain/compatibility/evaluate";
import type { ScenarioPreset } from "@/domain/compatibility/presets";
import type { CompatibilityRequirements } from "@/domain/compatibility/types";
import { humanizeCatalogValue, type Product } from "@/lib/catalog";

type CompatibilityAdvisorProps = {
  products: Product[];
  presets: ScenarioPreset[];
  initialPresetId?: string;
};

const selectOptions = {
  material: ["heating_oil", "propane", "refined_fuels", "lubricants", "water", "industrial_gases", "unsupported"],
  tankType: ["above_ground_horizontal", "above_ground_vertical", "above_ground_pressurized_horizontal", "above_ground_pressurized_vertical", "underground_vented", "open_top_process_tank", "upright_cylinder", "upright_cylinder_bank", "unknown"],
  existingInstrumentation: ["mechanical_float_gauge", "supported_remote_ready_propane_gauge", "none_required", "unknown"],
  gaugeInterface: ["confirmed_compatible", "not_applicable", "unknown"],
  connectivity: ["lte_m", "bluetooth_le", "ethernet", "unavailable", "unknown"],
  siteDistribution: ["distributed", "clustered", "single_site", "unknown"],
  measurementPreference: ["no_preference", "existing_float_gauge_interface", "existing_propane_gauge_interface", "non_contact_radar", "hydrostatic_pressure", "load_cell_weight", "unknown"],
} as const;

function statusPresentation(status: string) {
  if (status === "compatible") {
    return {
      label: "Compatible",
      className: "bg-emerald-400/15 text-emerald-300",
      icon: CheckCircle2,
    };
  }
  if (status === "out_of_scope") {
    return {
      label: "Out of scope",
      className: "bg-red-400/15 text-red-300",
      icon: XCircle,
    };
  }
  return {
    label: "Technical review required",
    className: "bg-amber-400/15 text-amber-200",
    icon: CircleAlert,
  };
}

export function CompatibilityAdvisor({ products, presets, initialPresetId }: CompatibilityAdvisorProps) {
  const initialPreset = presets.find((preset) => preset.id === initialPresetId) ?? presets[0];
  const [activePresetId, setActivePresetId] = useState<string | null>(initialPreset.id);
  const [requirements, setRequirements] = useState<CompatibilityRequirements>({
    ...initialPreset.requirements,
  });

  const result = useMemo(() => evaluateCompatibility(products, requirements), [products, requirements]);
  const status = statusPresentation(result.status);
  const StatusIcon = status.icon;

  function applyPreset(preset: ScenarioPreset) {
    setActivePresetId(preset.id);
    setRequirements({ ...preset.requirements });
  }

  function updateRequirement<Key extends keyof CompatibilityRequirements>(key: Key, value: CompatibilityRequirements[Key]) {
    setActivePresetId(null);
    setRequirements((current) => ({ ...current, [key]: value }));
  }

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">Step 1</p>
                  <CardTitle className="mt-2">Choose a starting point</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => applyPreset(presets[0])} aria-label="Reset to default preset">
                  <RotateCcw /> Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {presets.map((preset) => (
                <button key={preset.id} type="button" onClick={() => applyPreset(preset)} className={`rounded-xl border p-3 text-left transition-colors ${activePresetId === preset.id ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"}`}>
                  <Image src={preset.logoPath} alt="" width={36} height={36} />
                  <span className="mt-3 block text-sm font-medium">{preset.company}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{preset.title}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">Step 2</p>
              <CardTitle className="mt-2">Confirm structured requirements</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">Editing any value creates a custom scenario and immediately reruns the same deterministic rules.</p>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <RequirementSelect label="Stored material" value={requirements.material} options={selectOptions.material} onValueChange={(value) => updateRequirement("material", value as CompatibilityRequirements["material"])} />
              <RequirementSelect label="Tank type" value={requirements.tankType} options={selectOptions.tankType} onValueChange={(value) => updateRequirement("tankType", value)} />
              <RequirementSelect label="Existing instrumentation" value={requirements.existingInstrumentation} options={selectOptions.existingInstrumentation} onValueChange={(value) => updateRequirement("existingInstrumentation", value)} />
              <RequirementSelect label="Gauge interface" value={requirements.gaugeInterface} options={selectOptions.gaugeInterface} onValueChange={(value) => updateRequirement("gaugeInterface", value as CompatibilityRequirements["gaugeInterface"])} />
              <RequirementSelect label="Connectivity" value={requirements.connectivity} options={selectOptions.connectivity} onValueChange={(value) => updateRequirement("connectivity", value as CompatibilityRequirements["connectivity"])} />
              <RequirementSelect label="Site distribution" value={requirements.siteDistribution} options={selectOptions.siteDistribution} onValueChange={(value) => updateRequirement("siteDistribution", value as CompatibilityRequirements["siteDistribution"])} />
              <RequirementSelect label="Measurement preference" value={requirements.measurementPreference} options={selectOptions.measurementPreference} onValueChange={(value) => updateRequirement("measurementPreference", value)} />
              <RequirementSelect label="Regulated location" value={String(requirements.regulatedLocation)} options={["false", "true", "unknown"]} onValueChange={(value) => updateRequirement("regulatedLocation", value === "unknown" ? "unknown" : value === "true")} />
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-primary/20 bg-card/90 lg:sticky lg:top-24">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
            <div className="flex items-center gap-2">
              <StatusIcon className="size-4 text-primary" />
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">Deterministic result</span>
            </div>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
          <CardContent className="p-6">
            {result.primaryRecommendation ? (
              <div>
                <div className="grid gap-5 sm:grid-cols-[150px_1fr] sm:items-center">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/50">
                    <Image src={result.primaryRecommendation.product.image.path} alt={result.primaryRecommendation.product.image.alt} fill sizes="150px" className="object-cover" />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-primary">{result.primaryRecommendation.product.id}</p>
                    <h2 className="mt-1 text-2xl font-semibold">{result.primaryRecommendation.product.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{result.primaryRecommendation.product.tagline}</p>
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link href={`/catalog/${result.primaryRecommendation.product.slug}`}>View product profile</Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold">Matched evidence</h3>
                    <div className="mt-3 space-y-2">
                      {result.primaryRecommendation.matchedFields.map((field) => (
                        <div key={field} className="flex gap-2 text-xs text-muted-foreground">
                          <ShieldCheck className="size-4 shrink-0 text-emerald-400" />
                          <span className="font-mono">{field}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Decision record</h3>
                    <dl className="mt-3 space-y-3 text-xs">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Rule version</dt>
                        <dd className="font-mono">{result.ruleVersion}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Catalog version</dt>
                        <dd className="font-mono">2026.08.1</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Match score</dt>
                        <dd className="font-mono">{result.primaryRecommendation.score}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Preset privilege</dt>
                        <dd className="font-mono">None</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {result.alternatives.length > 0 ? (
                  <div className="mt-7 border-t border-border pt-5">
                    <h3 className="text-sm font-semibold">Compatible alternatives</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.alternatives.map((alternative) => (
                        <Badge key={alternative.product.id} variant="secondary">
                          {alternative.product.name} · {alternative.score}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="py-12 text-center">
                <StatusIcon className="mx-auto size-10 text-amber-300" />
                <h2 className="mt-4 text-xl font-semibold">No safe catalog recommendation</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">The engine will not invent a product. Change the confirmed inputs or route this fictional application to technical review.</p>
              </div>
            )}

            {result.reasons.length > 0 ? (
              <div className="mt-7 rounded-lg border border-border bg-background/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Outcome reasons</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {result.reasons.map((reason) => (
                    <li key={reason}>• {humanizeCatalogValue(reason)}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
      <AdvisorChat key={Object.values(requirements).join("|")} requirements={requirements} />
    </div>
  );
}

type RequirementSelectProps = {
  label: string;
  value: string;
  options: readonly string[];
  onValueChange: (value: string) => void;
};

function RequirementSelect({ label, value, options, onValueChange }: RequirementSelectProps) {
  const id = `requirement-${label.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="mt-2 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {humanizeCatalogValue(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
