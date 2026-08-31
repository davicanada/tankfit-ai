"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import {
  analyzeBriefAction,
  checkoutAction,
  confirmRequirementsAction,
  createOrderAction,
  decideOrderAction,
  enterStaffModeAction,
  exitStaffModeAction,
  initializeJourneyAction,
  resetJourneyAction,
} from "@/app/demo/actions";
import {
  defaultAirFlameRequirements,
  defaultRoiAssumptions,
  type AirFlameRequirements,
  type JourneyView,
  type RoiAssumptions,
} from "@/domain/journey/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const defaultBrief = `AirFlame Fuels manages 500 distributed above-ground horizontal heating-oil tanks. The sites use mechanical float gauges with a confirmed compatible adapter and LTE-M coverage. We want to begin with a 5-unit pilot, collect daily readings, receive low-level alerts, and operate between -25 C and 35 C. The pilot locations are not regulated.`;

const steps = [
  "Discover",
  "Recommend",
  "Business case",
  "Order",
  "Approve",
  "Proposal",
];

function money(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(value);
}

function activeStep(view: JourneyView | null) {
  if (!view?.requirementsConfirmed) return 0;
  if (!view.order) return 2;
  if (view.order.status === "draft") return 3;
  if (view.order.status === "pending_approval") return 4;
  if (view.order.status === "approved") return 5;
  return 4;
}

type JourneyActionResult = Awaited<ReturnType<typeof initializeJourneyAction>>;

export function AirFlameJourney() {
  const [view, setView] = useState<JourneyView | null>(null);
  const [requirements, setRequirements] = useState<AirFlameRequirements>(
    defaultAirFlameRequirements,
  );
  const [roiAssumptions, setRoiAssumptions] = useState<RoiAssumptions>(
    defaultRoiAssumptions,
  );
  const [brief, setBrief] = useState(defaultBrief);
  const [decisionNote, setDecisionNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [discoverySource, setDiscoverySource] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function applyResult(result: JourneyActionResult, successMessage?: string) {
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setView(result.view);
    setRequirements(result.view.requirements);
    setRoiAssumptions(result.view.roiAssumptions);
    setMessage(successMessage ?? null);
  }

  useEffect(() => {
    let active = true;
    void initializeJourneyAction().then((result) => {
      if (active) applyResult(result);
    });
    return () => {
      active = false;
    };
  }, []);

  function run(
    action: () => Promise<JourneyActionResult>,
    successMessage?: string,
  ) {
    setMessage(null);
    startTransition(async () => applyResult(await action(), successMessage));
  }

  function analyzeBrief() {
    setMessage(null);
    setDiscoverySource(null);
    startTransition(async () => {
      const result = await analyzeBriefAction({
        brief,
        currentRequirements: requirements,
      });
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setRequirements(result.requirements);
      setDiscoverySource(
        result.mode === "ai"
          ? `Structured by ${result.provider ?? "the AI provider"}; you remain in control of every field.`
          : "AI providers were unavailable, so the safe deterministic extractor filled explicit values.",
      );
    });
  }

  if (!view) {
    return (
      <Card className="border-primary/20 bg-card/70">
        <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 text-center text-muted-foreground">
          {message ? (
            <>
              <div>
                <p className="font-medium text-foreground">
                  The demo is temporarily unavailable.
                </p>
                <p className="mt-2 max-w-lg text-sm">{message}</p>
              </div>
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => run(initializeJourneyAction)}
              >
                {isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : null}
                Try again
              </Button>
            </>
          ) : (
            <>
              <LoaderCircle className="size-5 animate-spin text-primary" />
              Starting a private 24-hour demo session...
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentStep = activeStep(view);
  const order = view.order;

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-primary/25 bg-card/70">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logos/airflame-fuels.svg"
                alt="AirFlame Fuels fictional logo"
                width={42}
                height={42}
              />
              <div>
                <p className="font-semibold">AirFlame Fuels pilot</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Anonymous session {view.sessionId.slice(0, 8)} · expires in 24h
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() =>
                run(resetJourneyAction, "A fresh AirFlame journey is ready.")
              }
            >
              <RefreshCcw /> Reset demo
            </Button>
          </div>
          <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {steps.map((step, index) => (
              <li
                key={step}
                className="flex items-center gap-2 border-b border-r border-border/60 px-3 py-3 text-xs last:border-r-0 lg:border-b-0"
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full font-mono ${
                    index < currentStep
                      ? "bg-emerald-400/15 text-emerald-300"
                      : index === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className={index === currentStep ? "text-foreground" : "text-muted-foreground"}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {message ? (
        <div
          role="status"
          className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-foreground"
        >
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="discover-heading">
        <Card className="bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Bot className="size-4" />
              <span className="font-mono text-xs uppercase tracking-[0.15em]">AI discovery</span>
            </div>
            <CardTitle id="discover-heading" className="mt-2">Describe the operation naturally</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              maxLength={2_000}
              rows={9}
              aria-label="Operational brief"
              disabled={view.requirementsConfirmed || isPending}
            />
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              The AI may only extract facts. Compatibility, pricing, ROI, order state, and approval remain deterministic.
            </p>
            <Button
              className="mt-4 w-full sm:w-auto"
              disabled={view.requirementsConfirmed || isPending || brief.trim().length < 20}
              onClick={analyzeBrief}
            >
              {isPending ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
              Analyze brief
            </Button>
            {discoverySource ? (
              <p className="mt-3 text-xs leading-5 text-emerald-300">{discoverySource}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/70">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Confirm structured requirements</CardTitle>
              <Badge variant="outline">Editable</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company">
                <Input
                  value={requirements.companyName}
                  maxLength={80}
                  disabled={view.requirementsConfirmed}
                  onChange={(event) =>
                    setRequirements({ ...requirements, companyName: event.target.value })
                  }
                />
              </Field>
              <NumberField
                label="Managed tanks"
                value={requirements.fleetSize}
                disabled={view.requirementsConfirmed}
                onChange={(fleetSize) => setRequirements({ ...requirements, fleetSize })}
              />
              <NumberField
                label="Pilot quantity"
                value={requirements.pilotQuantity}
                disabled={view.requirementsConfirmed}
                onChange={(pilotQuantity) => setRequirements({ ...requirements, pilotQuantity })}
              />
              <Field label="Material"><LockedValue value="Heating oil" /></Field>
              <Field label="Tank configuration"><LockedValue value="Above-ground · horizontal" /></Field>
              <Field label="Existing gauge"><LockedValue value="Mechanical float gauge" /></Field>
              <Field label="Connectivity"><LockedValue value="LTE-M" /></Field>
              <Field label="Site pattern"><LockedValue value="Distributed" /></Field>
              <NumberField
                label="Minimum temperature (°C)"
                value={requirements.minimumTemperatureC}
                disabled={view.requirementsConfirmed}
                onChange={(minimumTemperatureC) =>
                  setRequirements({ ...requirements, minimumTemperatureC })
                }
              />
              <NumberField
                label="Maximum temperature (°C)"
                value={requirements.maximumTemperatureC}
                disabled={view.requirementsConfirmed}
                onChange={(maximumTemperatureC) =>
                  setRequirements({ ...requirements, maximumTemperatureC })
                }
              />
            </div>

            <Separator className="my-6" />
            <p className="mb-4 text-sm font-medium">Editable ROI assumptions</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField label="Annual runouts" value={roiAssumptions.annualRunouts} disabled={view.requirementsConfirmed} onChange={(annualRunouts) => setRoiAssumptions({ ...roiAssumptions, annualRunouts })} />
              <NumberField label="Cost / runout (CAD)" value={roiAssumptions.costPerRunoutCad} disabled={view.requirementsConfirmed} onChange={(costPerRunoutCad) => setRoiAssumptions({ ...roiAssumptions, costPerRunoutCad })} />
              <NumberField label="Runout reduction (%)" value={roiAssumptions.runoutReductionPercent} disabled={view.requirementsConfirmed} onChange={(runoutReductionPercent) => setRoiAssumptions({ ...roiAssumptions, runoutReductionPercent })} />
              <NumberField label="Emergency deliveries" value={roiAssumptions.annualEmergencyDeliveries} disabled={view.requirementsConfirmed} onChange={(annualEmergencyDeliveries) => setRoiAssumptions({ ...roiAssumptions, annualEmergencyDeliveries })} />
              <NumberField label="Extra cost / delivery" value={roiAssumptions.incrementalEmergencyCostCad} disabled={view.requirementsConfirmed} onChange={(incrementalEmergencyCostCad) => setRoiAssumptions({ ...roiAssumptions, incrementalEmergencyCostCad })} />
              <NumberField label="Delivery reduction (%)" value={roiAssumptions.emergencyReductionPercent} disabled={view.requirementsConfirmed} onChange={(emergencyReductionPercent) => setRoiAssumptions({ ...roiAssumptions, emergencyReductionPercent })} />
              <NumberField label="Annual manual checks" value={roiAssumptions.annualManualChecks} disabled={view.requirementsConfirmed} onChange={(annualManualChecks) => setRoiAssumptions({ ...roiAssumptions, annualManualChecks })} />
              <NumberField label="Cost / check (CAD)" value={roiAssumptions.costPerManualCheckCad} disabled={view.requirementsConfirmed} onChange={(costPerManualCheckCad) => setRoiAssumptions({ ...roiAssumptions, costPerManualCheckCad })} />
              <NumberField label="Check reduction (%)" value={roiAssumptions.manualCheckReductionPercent} disabled={view.requirementsConfirmed} onChange={(manualCheckReductionPercent) => setRoiAssumptions({ ...roiAssumptions, manualCheckReductionPercent })} />
            </div>
            <Button
              className="mt-6"
              disabled={view.requirementsConfirmed || isPending}
              onClick={() =>
                run(
                  () => confirmRequirementsAction({ requirements, roiAssumptions }),
                  "Requirements locked. The rules engine produced the recommendation and ROI.",
                )
              }
            >
              {isPending ? <LoaderCircle className="animate-spin" /> : <ClipboardCheck />}
              Confirm requirements
            </Button>
          </CardContent>
        </Card>
      </section>

      {view.requirementsConfirmed && view.recommendation && view.commerce ? (
        <section className="grid gap-5 lg:grid-cols-2" aria-label="Recommendation and business case">
          <Card className="overflow-hidden border-emerald-400/25 bg-card/70">
            <div className="grid h-full sm:grid-cols-[0.75fr_1.25fr]">
              <div className="relative min-h-64 bg-muted/30">
                <Image src="/images/products/floatlink-fl100.webp" alt="Fictional FloatLink FL-100 tank monitor" fill className="object-cover" sizes="(max-width: 640px) 100vw, 30vw" />
              </div>
              <CardContent className="flex flex-col justify-center p-6">
                <div className="flex items-center gap-2 text-emerald-300"><BadgeCheck className="size-4" /><span className="font-mono text-xs uppercase">Deterministic match</span></div>
                <p className="mt-5 font-mono text-xs text-primary">{view.recommendation.productId}</p>
                <h2 className="mt-1 text-2xl font-semibold">{view.recommendation.productName}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Existing float-gauge interface with direct LTE-M connectivity for the distributed AirFlame pilot.</p>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-muted-foreground">Unit</dt><dd className="mt-1 font-mono">{money(view.commerce.unitPriceCad)}</dd></div>
                  <div><dt className="text-muted-foreground">Service / month</dt><dd className="mt-1 font-mono">{money(view.commerce.monthlyServiceCad)}</dd></div>
                  <div><dt className="text-muted-foreground">Stock</dt><dd className="mt-1 font-mono">{view.commerce.stockQuantity}</dd></div>
                  <div><dt className="text-muted-foreground">Lead time</dt><dd className="mt-1 font-mono">{view.commerce.leadTimeBusinessDays} business days</dd></div>
                </dl>
                <p className="mt-5 font-mono text-[10px] text-muted-foreground">Rules {view.recommendation.ruleVersion} · commerce {view.commerce.commerceVersion}</p>
              </CardContent>
            </div>
          </Card>

          {view.roi ? (
            <Card className="bg-card/70">
              <CardHeader><CardTitle>Transparent business case</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Metric label="Annual operational benefit" value={money(view.roi.estimatedAnnualBenefitCad)} positive />
                  <Metric label="First-year fleet rollout" value={money(view.roi.estimatedFirstYearRolloutCostCad)} />
                  <Metric label="First-year net" value={money(view.roi.estimatedFirstYearNetCad)} />
                  <Metric label="Estimated payback" value={view.roi.estimatedPaybackMonths === null ? "N/A" : `${view.roi.estimatedPaybackMonths} months`} />
                </div>
                <Separator className="my-5" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <ValueRow label="Avoided runout cost" value={money(view.roi.avoidedRunoutCostCad)} />
                  <ValueRow label="Avoided emergency delivery cost" value={money(view.roi.avoidedEmergencyCostCad)} />
                  <ValueRow label="Avoided manual check cost" value={money(view.roi.avoidedManualCheckCostCad)} />
                </div>
                <p className="mt-5 text-xs leading-5 text-muted-foreground">Illustrative estimate from editable synthetic assumptions. It is not a guarantee or financial advice.</p>
              </CardContent>
            </Card>
          ) : null}
        </section>
      ) : null}

      {view.requirementsConfirmed && !order ? (
        <ActionCard icon={ShoppingCart} eyebrow="Pilot order" title="Create a five-unit draft from live database values" description="The application will re-read price, service fee, stock, and lead time from Neon. The AI cannot supply or override them.">
          <Button disabled={isPending} onClick={() => run(createOrderAction, "Draft pilot order created from current database values.")}>
            {isPending ? <LoaderCircle className="animate-spin" /> : <ShoppingCart />} Create draft order
          </Button>
        </ActionCard>
      ) : null}

      {order ? (
        <Card className="border-primary/20 bg-card/70">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-mono text-xs uppercase tracking-[0.15em] text-primary">Pilot order {order.id.slice(0, 8)}</p><CardTitle className="mt-2">{order.quantity} × FloatLink FL-100</CardTitle></div>
              <OrderStatus status={order.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric label="Hardware subtotal" value={money(order.hardwareSubtotalCad)} />
              <Metric label="Monthly service" value={money(order.monthlyServiceCad)} />
              <Metric label="Fictional refundable deposit" value={money(order.fictionalDepositCad)} />
            </div>

            {order.status === "draft" ? (
              <div className="mt-6 rounded-xl border border-amber-400/25 bg-amber-400/5 p-5">
                <div className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-300" /><div><p className="font-medium">Simulated checkout only</p><p className="mt-1 text-sm leading-6 text-muted-foreground">No card form, payment processor, or real money is used. The action records an internal fictional authorization and sends the order to approval.</p></div></div>
                <Button className="mt-4" disabled={isPending} onClick={() => run(() => checkoutAction({ orderId: order.id }), "Fictional deposit authorized. The order is waiting for human approval.")}>
                  {isPending ? <LoaderCircle className="animate-spin" /> : <ArrowRight />} Authorize fictional deposit
                </Button>
              </div>
            ) : null}

            {order.status === "pending_approval" && !view.staffMode ? (
              <div className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-5">
                <div className="flex gap-3"><UserRoundCheck className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="font-medium">Human-in-the-loop checkpoint</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Switch roles inside this same anonymous demo. A short-lived signed token limits Demo Staff Mode to this order.</p></div></div>
                <Button className="mt-4" disabled={isPending} onClick={() => run(() => enterStaffModeAction({ orderId: order.id }), "Demo Staff Mode enabled for ten minutes.")}><UserRoundCheck /> Enter Demo Staff Mode</Button>
              </div>
            ) : null}

            {order.status === "pending_approval" && view.staffMode ? (
              <div className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-5">
                <div className="flex items-center justify-between gap-3"><div><p className="font-medium text-emerald-200">Demo Staff Mode</p><p className="mt-1 text-sm text-muted-foreground">Review the synthetic order and record a deliberate decision.</p></div><Badge className="bg-emerald-400/15 text-emerald-300">Signed role token</Badge></div>
                <Label htmlFor="decision-note" className="mt-5">Decision note (optional)</Label>
                <Textarea id="decision-note" className="mt-2" value={decisionNote} maxLength={500} onChange={(event) => setDecisionNote(event.target.value)} placeholder="Example: Approved for the five-site pilot." />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button disabled={isPending} onClick={() => run(() => decideOrderAction({ orderId: order.id, decision: "approved", note: decisionNote }), "Order approved. The fictional proposal is ready.")}><CheckCircle2 /> Approve pilot</Button>
                  <Button variant="outline" disabled={isPending} onClick={() => run(() => decideOrderAction({ orderId: order.id, decision: "changes_requested", note: decisionNote }), "Changes requested and recorded in the audit trail.")}>Request changes</Button>
                  <Button variant="destructive" disabled={isPending} onClick={() => run(() => decideOrderAction({ orderId: order.id, decision: "rejected", note: decisionNote }), "Order rejected and recorded in the audit trail.")}>Reject</Button>
                  <Button variant="ghost" disabled={isPending} onClick={() => run(exitStaffModeAction)}>Exit staff mode</Button>
                </div>
              </div>
            ) : null}

            {order.status === "approved" && view.proposalId ? (
              <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-6 text-center">
                <FileText className="mx-auto size-8 text-emerald-300" />
                <h3 className="mt-3 text-xl font-semibold">Approved proposal ready</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Generated only from the approved database state and watermarked as a synthetic competition demo on every page.</p>
                <Button asChild className="mt-5"><a href={`/api/proposals/${view.proposalId}`} target="_blank" rel="noreferrer"><Download /> Download fictional proposal</a></Button>
              </div>
            ) : null}

            {(order.status === "changes_requested" || order.status === "rejected") ? (
              <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5"><p className="font-medium">Decision recorded: {order.status.replace("_", " ")}</p>{order.decisionNote ? <p className="mt-2 text-sm text-muted-foreground">“{order.decisionNote}”</p> : null}<p className="mt-3 text-xs text-muted-foreground">Reset the public demo to run a fresh journey.</p></div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/50 p-4 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>All names, products, prices, inventory, operational metrics, payments, decisions, and documents in this experience are fictional and synthetic. This is an independent personal project created exclusively for the Jornada de Dados competition.</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="mb-2">{label}</Label>{children}</div>;
}

function NumberField({ label, value, disabled, onChange }: { label: string; value: number; disabled?: boolean; onChange: (value: number) => void }) {
  return <Field label={label}><Input type="number" value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} /></Field>;
}

function LockedValue({ value }: { value: string }) {
  return <div className="flex h-8 items-center rounded-lg border border-border bg-muted/40 px-2.5 text-sm text-muted-foreground"><Check className="mr-2 size-3.5 text-emerald-300" />{value}</div>;
}

function Metric({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return <div className="rounded-xl border border-border/70 bg-background/50 p-4"><p className="text-xs leading-5 text-muted-foreground">{label}</p><p className={`mt-2 font-mono text-lg ${positive ? "text-emerald-300" : "text-foreground"}`}>{value}</p></div>;
}

function ValueRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><span>{label}</span><span className="font-mono text-foreground">{value}</span></div>;
}

function ActionCard({ icon: Icon, eyebrow, title, description, children }: { icon: typeof ShoppingCart; eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <Card className="border-primary/20 bg-card/70"><CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex max-w-3xl gap-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div><div><p className="font-mono text-xs uppercase tracking-[0.15em] text-primary">{eyebrow}</p><h2 className="mt-2 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div></div><div className="shrink-0">{children}</div></CardContent></Card>;
}

function OrderStatus({ status }: { status: NonNullable<JourneyView["order"]>["status"] }) {
  const labels = { draft: "Draft", pending_approval: "Pending approval", approved: "Approved", changes_requested: "Changes requested", rejected: "Rejected" };
  return <Badge variant="outline" className={status === "approved" ? "border-emerald-400/30 text-emerald-300" : status === "rejected" ? "border-destructive/40 text-destructive" : "border-primary/30 text-primary"}>{labels[status]}</Badge>;
}
