import Link from "next/link";
import { ArrowRight, Bot, Database, ShieldCheck } from "lucide-react";
import { FictionNotice } from "@/components/fiction-notice";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COMPATIBILITY_RULE_VERSION } from "@/domain/compatibility/evaluate";
import { catalog } from "@/lib/catalog";
import { tankroy } from "@/lib/companies";

export default function Home() {
  return (
    <>
      <FictionNotice />
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {tankroy.name} · fictional monitoring solutions
            </Badge>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              From an operational problem to a{" "}
              <span className="text-primary">
                grounded tank-monitoring fit
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Tankroy&apos;s fictional monitors help illustrate how fuel, water
              and industrial-gas operators could understand their inventory.
              Explore our synthetic catalog and ask TankFit AI which solution
              fits your fictional needs.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/advisor">
                  Ask TankFit AI <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/catalog">Browse all 13 products</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-border/70 pt-6">
              <div>
                <dt className="text-xs text-muted-foreground">Catalog</dt>
                <dd className="mt-1 font-mono text-sm sm:text-lg">
                  13 products
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Rule set</dt>
                <dd className="mt-1 font-mono text-sm sm:text-lg">
                  v{COMPATIBILITY_RULE_VERSION}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Data</dt>
                <dd className="mt-1 font-mono text-sm sm:text-lg">
                  100% synthetic
                </dd>
              </div>
            </dl>
          </div>

          <Card className="relative overflow-hidden border-primary/20 bg-card/90 p-0 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Custom discovery workspace
                </span>
              </div>
              <Badge className="bg-primary/15 text-primary">Start here</Badge>
            </div>
            <CardContent className="p-6">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary">
                No scenario loaded
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Start with your own fictional operation
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Describe what you store, how your tanks are monitored, and
                what your team wants to improve. TankFit AI will ask focused
                questions while the rules engine keeps unknown facts visible.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {["Describe the need", "Review the facts", "See a grounded fit"].map(
                  (step, index) => (
                    <div
                      key={step}
                      className="rounded-lg border border-border/70 bg-background/60 p-3"
                    >
                      <span className="font-mono text-xs text-primary">
                        0{index + 1}
                      </span>
                      <p className="mt-2 text-sm font-medium">{step}</p>
                    </div>
                  ),
                )}
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span>Every recommendation is decided from confirmed requirements.</span>
              </div>
              <Button asChild className="mt-6">
                <Link href="/advisor">
                  Describe your situation <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Two-layer architecture
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Conversation can be flexible. Technical truth cannot
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Bot,
              title: "Multilingual conversation",
              text: "The AI layer interprets needs and explains grounded results in the visitor’s language.",
            },
            {
              icon: Database,
              title: "Structured catalog",
              text: "Product claims come from versioned synthetic records, never from model memory.",
            },
            {
              icon: ShieldCheck,
              title: "Deterministic controls",
              text: "Compatibility, calculations, orders, and approval states remain under application code.",
            },
          ].map((item) => (
            <Card key={item.title} className="bg-card/60">
              <CardContent>
                <item.icon className="size-5 text-primary" />
                <h3 className="mt-5 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                Custom-first discovery
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Your situation is the starting point
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                There is no preloaded customer or scripted scenario. Bring a
                fictional operation in your own words and review what the
                application can safely confirm.
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/advisor">
                Start discovery <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Describe the operation",
                text: "Use ordinary language. A company name is optional and all information stays fictional.",
              },
              {
                title: "Clarify what matters",
                text: "The assistant asks one relevant question at a time and leaves unknown facts unresolved.",
              },
              {
                title: "Inspect the decision",
                text: "The catalog and deterministic rules show the evidence behind a fit or a technical review.",
              },
            ].map((item) => (
              <Card key={item.title} className="bg-background/70">
                <CardContent>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              Catalog preview
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Built for materially different applications
            </h2>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/catalog">View catalog</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {catalog.products.slice(0, 3).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              eager={index === 0}
            />
          ))}
        </div>
      </section>
    </>
  );
}
