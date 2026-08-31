import type { Metadata } from "next";
import { AirFlameJourney } from "@/components/airflame-journey";
import { FictionNotice } from "@/components/fiction-notice";

export const metadata: Metadata = {
  title: "AirFlame end-to-end demo",
  description:
    "Run a complete fictional tank-monitoring journey from discovery and recommendation to simulated checkout, approval, and proposal.",
};

export default function DemoPage() {
  return (
    <>
      <FictionNotice />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Golden-path simulation
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Take AirFlame from field problem to approved proposal.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            This public demonstration uses synthetic data, a fictional deposit,
            and a temporary anonymous session. No real purchase, payment, or
            customer information is involved.
          </p>
        </div>
        <div className="mt-10">
          <AirFlameJourney />
        </div>
      </div>
    </>
  );
}
