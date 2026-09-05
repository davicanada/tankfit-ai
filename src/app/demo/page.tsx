import Link from "next/link";
import { FictionNotice } from "@/components/fiction-notice";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Demo Hub" };
export default function DemoPage() {
  return (
    <>
      <FictionNotice />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm text-primary">
          One fictional opportunity, two perspectives
        </p>
        <h1 className="mt-3 text-4xl font-semibold">
          Choose your demo experience
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          Explore Tankroy as a customer, then switch to the sales perspective to
          review your own private opportunity. Choosing a perspective does not
          grant approval permissions.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Customer Experience",
              href: "/demo/customer",
              text: "Browse, ask TankFit AI, confirm requirements and try test checkout.",
              action: "Experience the Customer Journey",
            },
            {
              title: "Sales Team Experience",
              href: "/demo/sales",
              text: "Review your session's opportunity, inspect its history and explicitly enter scoped Demo Staff Mode.",
              action: "Experience the Sales Team Workspace",
            },
          ].map((mode) => (
            <article
              key={mode.href}
              className="space-y-5 rounded-xl border bg-card p-8"
            >
              <h2 className="text-2xl font-semibold">{mode.title}</h2>
              <p className="text-muted-foreground">{mode.text}</p>
              <Button asChild>
                <Link href={mode.href}>{mode.action}</Link>
              </Button>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          All companies, products, transactions and documents are fictional.
          Independent project by Davi Almeida for the Jornada de Dados
          competition.
        </p>
      </section>
    </>
  );
}
