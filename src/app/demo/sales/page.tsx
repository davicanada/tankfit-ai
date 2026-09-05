import Link from "next/link";
import { AirFlameJourney } from "@/components/airflame-journey";
import { FictionNotice } from "@/components/fiction-notice";

export const metadata = { title: "Sales Team Experience" };
export default function SalesPage() {
  return (
    <>
      <FictionNotice />
      <section className="mx-auto max-w-7xl space-y-8 px-6 py-12">
        <Link href="/demo" className="text-primary">
          ← Demo Hub
        </Link>
        <header>
          <h1 className="text-4xl font-semibold">Sales Team Experience</h1>
          <p className="mt-4 text-muted-foreground">
            Review only your own anonymous opportunity. This is a role
            simulation, not an employee portal. Opening this page grants no
            approval authority.
          </p>
        </header>
        <AirFlameJourney mode="sales" />
      </section>
    </>
  );
}
