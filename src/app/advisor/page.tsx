import { TankFitJourney } from "@/components/airflame-journey";
import { DiscoveryChat } from "@/components/discovery-chat";
import { FictionNotice } from "@/components/fiction-notice";

export const metadata = { title: "Ask TankFit AI" };
export default function AdvisorPage() {
  return (
    <>
      <FictionNotice />
      <section className="mx-auto max-w-7xl space-y-8 px-6 py-12">
        <header>
          <h1 className="text-4xl font-semibold">
            Find a fictional monitoring fit
          </h1>
          <p className="mt-4 text-muted-foreground">
            Start with your own fictional operation in your language. TankFit AI
            explains; deterministic rules decide. Review unknown facts using the
            guided fields below.
          </p>
        </header>
        <DiscoveryChat />
        <TankFitJourney mode="advisor" />
      </section>
    </>
  );
}
