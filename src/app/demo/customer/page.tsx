import Link from "next/link";
import { TankFitJourney } from "@/components/airflame-journey";
import { FictionNotice } from "@/components/fiction-notice";
import { DiscoveryChat } from "@/components/discovery-chat";

export const metadata = { title: "Customer Experience" };
export default function CustomerPage() {
  return (
    <>
      <FictionNotice />
      <section className="mx-auto max-w-7xl space-y-8 px-6 py-12">
        <Link href="/demo" className="text-primary">
          ← Demo Hub
        </Link>
        <header>
          <h1 className="text-4xl font-semibold">Customer Experience</h1>
          <p className="mt-4 text-muted-foreground">
            Describe your own fictional operation with TankFit AI or use the
            guided fields. Browse the same{" "}
            <Link href="/catalog" className="underline">
              fictional Tankroy catalog
            </Link>
            .
          </p>
        </header>
        <DiscoveryChat />
        <TankFitJourney mode="customer" />
      </section>
    </>
  );
}
