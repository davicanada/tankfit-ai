"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  initializeJourneyAction,
  resetJourneyAction,
  analyzeBriefAction,
  confirmRequirementsAction,
  createOrderAction,
  checkoutAction,
  reconcileCheckoutAction,
  enterStaffModeAction,
  decideOrderAction,
  exitStaffModeAction,
  requestSalesReviewAction,
  acceptProposalAction,
  reviseRequestAction,
} from "@/app/demo/actions";
import {
  emptyRequirements,
  defaultRoiAssumptions,
  emptyBusinessBrief,
  tankTypes,
  instrumentationTypes,
  measurementMethods,
  type AirFlameRequirements,
  type JourneyView,
} from "@/domain/journey/types";
import { supportedMaterials } from "@/domain/compatibility/types";
import { evaluateJourney } from "@/domain/journey/evaluate";
import { humanizeCatalogValue } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const money = (value: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(
    value,
  );
const options = {
  material: [...supportedMaterials, "unsupported", "unknown"],
  tankType: tankTypes,
  existingInstrumentation: instrumentationTypes,
  gaugeInterface: ["confirmed_compatible", "not_applicable", "unknown"],
  connectivity: ["lte_m", "bluetooth_le", "ethernet", "unavailable", "unknown"],
  siteDistribution: ["distributed", "clustered", "single_site", "unknown"],
  measurementPreference: measurementMethods,
  readingFrequency: ["daily", "twice_daily", "weekly", "unknown"],
  lowLevelAlerts: ["true", "false", "unknown"],
  regulatedLocation: ["true", "false", "unknown"],
  clearSensorPath: ["true", "false", "unknown"],
  foamOrObstructions: ["true", "false", "unknown"],
  cylinderFootprintConfirmed: ["true", "false", "unknown"],
  shelteredInstallation: ["true", "false", "unknown"],
  gatewayCoverageConfirmed: ["true", "false", "unknown"],
  wettedMaterialCompatible: ["true", "false", "unknown"],
};
const label = (value: string) =>
  humanizeCatalogValue(value.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase());
type Result = Awaited<ReturnType<typeof initializeJourneyAction>>;

export function TankFitJourney({
  mode = "customer",
}: {
  mode?: "customer" | "sales" | "advisor";
}) {
  const [view, setView] = useState<JourneyView | null>(null);
  const [requirements, setRequirements] =
    useState<AirFlameRequirements>(emptyRequirements);
  const [roi, setRoi] = useState(defaultRoiAssumptions);
  const [businessBrief, setBusinessBrief] = useState(emptyBusinessBrief);
  const [brief, setBrief] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const requestVersion = useRef(0);
  const sales = mode === "sales";
  const customer = mode === "customer";
  const frozen = Boolean(view?.order);

  function apply(result: Result) {
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setView(result.view);
    setRequirements(result.view.requirements);
    setRoi(result.view.roiAssumptions);
    setBusinessBrief(result.view.businessBrief);
    if (result.view.requirementsConfirmed)
      window.dispatchEvent(new Event("tankfit-requirements-confirmed"));
    else window.dispatchEvent(new Event("tankfit-requirements-reopened"));
    if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
  }
  useEffect(() => {
    let active = true;
    const load = () => {
      const version = ++requestVersion.current;
      void initializeJourneyAction().then((result) => {
        if (active && version === requestVersion.current) apply(result);
      });
    };
    load();
    const refresh = load;
    window.addEventListener("tankfit-discovery-updated", refresh);
    return () => {
      active = false;
      window.removeEventListener("tankfit-discovery-updated", refresh);
    };
  }, []);
  function run(action: () => Promise<Result>) {
    setMessage("");
    const version = ++requestVersion.current;
    startTransition(async () => {
      try {
        const result = await action();
        if (version === requestVersion.current) apply(result);
      } catch {
        if (version === requestVersion.current)
          setMessage("This step is temporarily unavailable. Please retry.");
      }
    });
  }
  const localResult = evaluateJourney(requirements);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {view
            ? `Private demo expires ${new Date(view.expiresAt).toLocaleString("en-CA")}`
            : "Guided catalog mode remains available while the database connects."}
        </p>
        {view && (
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() =>
              run(async () => {
                const result = await resetJourneyAction();
                if (result.ok)
                  window.dispatchEvent(new Event("tankfit-session-reset"));
                return result;
              })
            }
          >
            Reset demo
          </Button>
        )}
      </div>
      <p role="status" aria-live="polite" className="text-sm text-amber-200">
        {isPending ? "Working…" : message}
      </p>
      {sales && !view?.order && !view?.salesRequested && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-xl font-semibold">No opportunity in this session</h2>
            <p>
              Start in Customer Experience and describe a fictional operation.
              Once the customer submits a request, Sales can review that same
              session-owned opportunity.
            </p>
            <Button asChild>
              <Link href="/demo/customer">Continue in Customer Experience</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      {customer && !frozen && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-xl font-semibold">
              What would a successful pilot achieve?
            </h2>
            <p className="text-sm">
              Optional fictional context for Sales. You can request help even if
              technical details are unknown.
            </p>
            {(["objective", "timeline", "successCriteria"] as const).map(
              (key) => (
                <label className="block space-y-1" key={key}>
                  <span>
                    {key === "objective"
                      ? "Business objective"
                      : key === "timeline"
                        ? "Target timeline"
                        : "Pilot success criteria"}
                  </span>
                  <Textarea
                    maxLength={key === "timeline" ? 200 : 500}
                    value={businessBrief[key]}
                    onChange={(e) =>
                      setBusinessBrief({
                        ...businessBrief,
                        [key]: e.target.value,
                      })
                    }
                  />
                </label>
              ),
            )}
            <Button
              disabled={isPending || !view}
              variant="outline"
              onClick={() =>
                run(() =>
                  requestSalesReviewAction({ requirements, businessBrief }),
                )
              }
            >
              Request Sales help
            </Button>
            {view?.salesRequested && (
              <p role="status">
                Opportunity saved for the Sales demonstration. No staff
                notification is sent.
              </p>
            )}
            {view?.salesRequested && (
              <Button asChild variant="outline">
                <Link href="/demo/sales">
                  Continue in Sales Team Experience
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      {sales && view?.salesRequested && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h2 className="text-xl font-semibold">Opportunity brief</h2>
            <p>
              Objective: {view.businessBrief.objective || "Not specified yet"}
            </p>
            <p>
              Timeline: {view.businessBrief.timeline || "Not specified yet"}
            </p>
            <p>
              Pilot success criteria:{" "}
              {view.businessBrief.successCriteria ||
                "Agree on readings, alert usefulness and manual-check effort before a rollout decision."}
            </p>
            {!view.order && (
              <>
                <p>
                  Next action: help the customer clarify the pending facts, then
                  validate a configuration. No payment is needed for this
                  review.
                </p>
                <p>Assessment: {label(localResult.status)}</p>
                <ul>
                  {localResult.reasons.map((reason) => (
                    <li key={reason}>{label(reason)}</li>
                  ))}
                </ul>
                <details>
                  <summary>Customer-stated facts</summary>
                  <pre className="whitespace-pre-wrap break-words text-xs">
                    {JSON.stringify(view.requirements, null, 2)}
                  </pre>
                </details>
                <Button asChild>
                  <Link href="/demo/customer">
                    Continue in Customer Experience
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
      {!sales && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <h2 className="text-xl font-semibold">
              Describe your own situation
            </h2>
            <p className="text-sm text-muted-foreground">
              Fictional information only. A new brief replaces unmentioned
              technical fields with unknown values. Review the extraction; it is
              not an engineering assessment.
            </p>
            <label className="block space-y-2">
              <span>Operational brief</span>
              <Textarea
                value={brief}
                maxLength={2000}
                disabled={frozen || isPending}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Describe a fictional material, tank, gauge, coverage and monitoring need…"
              />
            </label>
            <Button
              disabled={
                frozen || isPending || brief.trim().length < 20 || !view
              }
              onClick={() =>
                startTransition(async () => {
                  const result = await analyzeBriefAction({
                    brief,
                    currentRequirements: requirements,
                  });
                  if (!result.ok) setMessage(result.error);
                  else {
                    setRequirements(result.requirements);
                    setMessage(
                      "Review the extracted facts. Unknown values need your clarification.",
                    );
                  }
                })
              }
            >
              Analyze brief
            </Button>
            <fieldset
              disabled={frozen || isPending}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <legend className="mb-4 font-semibold">
                Confirm the technical facts
              </legend>
              <label className="space-y-1">
                <span>Fictional organization</span>
                <Input
                  maxLength={80}
                  value={requirements.companyName}
                  onChange={(e) =>
                    setRequirements({
                      ...requirements,
                      companyName: e.target.value,
                    })
                  }
                />
              </label>
              {Object.entries(options).map(([key, values]) => (
                <label key={key} className="space-y-1">
                  <span>{label(key)}</span>
                  <select
                    className="w-full rounded-md border bg-background p-2"
                    value={String(
                      requirements[key as keyof AirFlameRequirements],
                    )}
                    onChange={(e) =>
                      setRequirements({
                        ...requirements,
                        [key]:
                          e.target.value === "true"
                            ? true
                            : e.target.value === "false"
                              ? false
                              : e.target.value,
                      })
                    }
                  >
                    {values.map((value) => (
                      <option key={value} value={value}>
                        {label(value)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              {(
                [
                  "fleetSize",
                  "pilotQuantity",
                  "minimumTemperatureC",
                  "maximumTemperatureC",
                ] as const
              ).map((key) => (
                <label key={key} className="space-y-1">
                  <span>{label(key)}</span>
                  <Input
                    type="number"
                    value={requirements[key] ?? ""}
                    onChange={(e) =>
                      setRequirements({
                        ...requirements,
                        [key]:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
              ))}
            </fieldset>
            <div className="rounded-lg border p-4">
              <p className="font-medium">
                Guided assessment: {label(localResult.status)}
              </p>
              <ul className="mt-2 text-sm text-muted-foreground">
                {localResult.reasons.map((reason) => (
                  <li key={reason}>{label(reason)}</li>
                ))}
              </ul>
            </div>
            <Button
              disabled={frozen || isPending || !view}
              onClick={() =>
                run(() =>
                  confirmRequirementsAction({
                    requirements,
                    roiAssumptions: roi,
                    businessBrief,
                  }),
                )
              }
            >
              Confirm requirements
            </Button>
            {!customer && (
              <Button asChild variant="outline">
                <Link href="/demo/customer">
                  Continue in Customer Experience
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      {view?.requirementsConfirmed && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-xl font-semibold">
              {view.recommendation?.productName ?? "Technical review"}
            </h2>
            <p>{label(view.recommendation?.status ?? "unknown")}</p>
            <p className="text-xs text-muted-foreground">
              Evidence rule: {view.recommendation?.ruleVersion}
            </p>
            <ul className="text-sm">
              {view.recommendation?.reasons.map((r) => (
                <li key={r}>{label(r)}</li>
              ))}
            </ul>
            {view.commerce && (
              <p>
                Current database values: {money(view.commerce.unitPriceCad)} per
                unit · {view.commerce.stockQuantity} in fictional stock ·{" "}
                {view.commerce.leadTimeBusinessDays} business days
              </p>
            )}
            {view.roi && (
              <>
                <h3 className="font-semibold">
                  Illustrative fleet business case
                </h3>
                <p>
                  Annual benefit {money(view.roi.estimatedAnnualBenefitCad)} ·
                  first-year rollout cost{" "}
                  {money(view.roi.estimatedFirstYearRolloutCostCad)} · net
                  impact {money(view.roi.estimatedFirstYearNetCad)}
                </p>
                <p className="text-sm">
                  Simple payback:{" "}
                  {view.roi.estimatedPaybackMonths?.toFixed(2) ?? "Not reached"}{" "}
                  {view.roi.estimatedPaybackMonths !== null
                    ? "months."
                    : "under these assumptions."}{" "}
                  Synthetic assumptions, not a financial forecast. Fleet rollout
                  is separate from the pilot.
                </p>
                <p className="text-sm">
                  Payback uses initial hardware cost divided by annual benefit
                  after recurring service. Installation, taxes, freight and
                  maintenance are excluded.
                </p>
              </>
            )}
            {!sales && !frozen && (
              <details>
                <summary>Edit ROI assumptions</summary>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {Object.entries(roi).map(([key, value]) => (
                    <label key={key}>
                      <span>{label(key)}</span>
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          setRoi({ ...roi, [key]: Number(e.target.value) })
                        }
                      />
                    </label>
                  ))}
                </div>
                <Button
                  className="mt-4"
                  disabled={isPending}
                  onClick={() =>
                    run(() =>
                      confirmRequirementsAction({
                        requirements,
                        roiAssumptions: roi,
                        businessBrief,
                      }),
                    )
                  }
                >
                  Recalculate business case
                </Button>
              </details>
            )}
            {sales && (
              <details>
                <summary>Requirements and ROI assumptions</summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs">
                  {JSON.stringify(
                    {
                      requirements: view.requirements,
                      assumptions: view.roiAssumptions,
                    },
                    null,
                    2,
                  )}
                </pre>
              </details>
            )}
            {customer &&
              !view.order &&
              view.recommendation?.status === "compatible" && (
                <Button
                  disabled={isPending}
                  onClick={() => run(createOrderAction)}
                >
                  Submit pilot for Sales review
                </Button>
              )}
          </CardContent>
        </Card>
      )}
      {view?.order && (customer || sales) && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-xl font-semibold">
              Pilot request · {label(view.order.status)} · Revision{" "}
              {view.order.revision}
            </h2>
            <p>
              {view.order.quantity} units · hardware{" "}
              {money(view.order.hardwareSubtotalCad)} · service{" "}
              {money(view.order.monthlyServiceCad)}/month
            </p>
            <p className="text-sm text-muted-foreground">
              Frozen fictional scope. Unaccepted requests can be revised. No
              real goods or money.
            </p>
            {view.order.workflowVersion !== 2 && (
              <p>
                This is a historical demo workflow. Reset the demo to try the
                new proposal-first journey.
              </p>
            )}
            {customer &&
              view.order.status === "approved" &&
              view.order.workflowVersion === 2 && (
                <>
                  <p>
                    Review the approved proposal before accepting this revision.
                    Acceptance enables a CAD 250 test deposit. Hardware and
                    recurring service remain the separate values shown above;
                    this demo does not collect the remaining balance or activate
                    a subscription.
                  </p>
                  <Button
                    disabled={isPending}
                    onClick={() =>
                      run(() =>
                        acceptProposalAction({ orderId: view.order!.id }),
                      )
                    }
                  >
                    Accept proposal
                  </Button>
                </>
              )}
            {customer && view.order.status === "accepted" && (
              <>
                <p>
                  Stripe sandbox deposit:{" "}
                  {money(view.order.fictionalDepositCad)}. Use test card 4242
                  4242 4242 4242, a future expiry and fictional CVC. Never enter
                  real payment or personal details.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={isPending}
                    onClick={() =>
                      run(() => checkoutAction({ orderId: view.order!.id }))
                    }
                  >
                    Open Stripe test checkout
                  </Button>
                  <Button
                    variant="outline"
                    disabled={isPending}
                    onClick={() => run(reconcileCheckoutAction)}
                  >
                    Check test payment status
                  </Button>
                </div>
              </>
            )}
            {sales && ["approved", "accepted"].includes(view.order.status) && (
              <Button asChild>
                <Link href="/demo/customer">Continue as customer</Link>
              </Button>
            )}
            {customer && view.order.status === "pending_approval" && (
              <Button asChild>
                <Link href="/demo/sales">
                  Continue in Sales Team Experience
                </Link>
              </Button>
            )}
            {sales &&
              view.order.status === "pending_approval" &&
              view.order.workflowVersion === 2 &&
              (!view.staffMode ? (
                <Button
                  disabled={isPending}
                  onClick={() =>
                    run(() => enterStaffModeAction({ orderId: view.order!.id }))
                  }
                >
                  Enter Demo Staff Mode
                </Button>
              ) : (
                <>
                  <p className="font-medium">
                    Demo Staff Mode · scoped to this order only
                  </p>
                  <label className="block">
                    Decision note
                    <Textarea
                      maxLength={500}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(
                      ["approved", "changes_requested", "rejected"] as const
                    ).map((decision) => (
                      <Button
                        key={decision}
                        disabled={isPending}
                        variant={
                          decision === "approved" ? "default" : "outline"
                        }
                        onClick={() =>
                          run(() =>
                            decideOrderAction({
                              orderId: view.order!.id,
                              decision,
                              note,
                            }),
                          )
                        }
                      >
                        {decision === "approved"
                          ? "Approve pilot"
                          : label(decision)}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => run(exitStaffModeAction)}
                    >
                      Exit staff mode
                    </Button>
                  </div>
                </>
              ))}
            {view.order.decisionNote && (
              <p>Decision note: {view.order.decisionNote}</p>
            )}
            {customer &&
              view.order.workflowVersion === 2 &&
              [
                "pending_approval",
                "approved",
                "changes_requested",
                "rejected",
              ].includes(view.order.status) && (
                <Button
                  variant="outline"
                  disabled={isPending}
                  onClick={() =>
                    run(() => reviseRequestAction({ orderId: view.order!.id }))
                  }
                >
                  Revise request
                </Button>
              )}
            {sales &&
              ["changes_requested", "rejected"].includes(view.order.status) && (
                <Button asChild variant="outline">
                  <Link href="/demo/customer">
                    Return to customer for revision
                  </Link>
                </Button>
              )}
            {view.order.status === "paid" && (
              <div className="space-y-2">
                <h3 className="font-semibold">Test payment complete</h3>
                <p>
                  The approved pilot has completed the demo payment journey.
                </p>
                <p>
                  Proposed next step: evaluate readings, alert usefulness and
                  manual-check effort against the pilot criteria, then decide
                  whether to expand, adjust or stop. Fulfillment and telemetry
                  are not simulated.
                </p>
              </div>
            )}
            {view.proposalId && (
              <Button asChild>
                <a href={`/api/proposals/${view.proposalId}`}>
                  Download fictional proposal
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      {view && view.revisions.length > 1 && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h2 className="text-xl font-semibold">Revision history</h2>
            {view.revisions.map((entry) => (
              <p key={entry.id}>
                Revision {entry.revision}: {label(entry.status)}
                {entry.decisionNote ? ` — ${entry.decisionNote}` : ""}
              </p>
            ))}
          </CardContent>
        </Card>
      )}
      {sales && view && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-xl font-semibold">Customer conversation</h2>
            <p className="text-sm">
              Session-owned fictional discovery, retained until this demo
              expires or is reset.
            </p>
            {view.conversation.length === 0 && (
              <p>
                No chat transcript. Review the confirmed structured requirements
                above.
              </p>
            )}
            {view.conversation.map((entry, index) => (
              <p
                key={index}
                className="whitespace-pre-wrap break-words text-sm"
              >
                <strong>
                  {entry.role === "user" ? "Visitor" : "TankFit AI"}:{" "}
                </strong>
                {entry.content}
              </p>
            ))}
            <h2 className="text-xl font-semibold">
              Session audit and AI usage
            </h2>
            <p className="text-sm">
              Only this session. Token usage is reported when supplied by the
              provider. Billing cost is unavailable, not assumed zero. Global
              request caps limit usage.
            </p>
            <ol className="space-y-4">
              {view.events.map((event) => (
                <li key={event.id} className="border-l-2 border-primary pl-4">
                  <p className="font-medium">{label(event.eventType)}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.createdAt} · {event.actor}
                  </p>
                  <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
