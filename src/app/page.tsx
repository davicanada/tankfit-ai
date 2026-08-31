import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Database, ShieldCheck } from "lucide-react";
import { FictionNotice } from "@/components/fiction-notice";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { evaluateCompatibility } from "@/domain/compatibility/evaluate";
import { scenarioPresets } from "@/domain/compatibility/presets";
import { catalog } from "@/lib/catalog";

export default function Home() {
  const featuredResult = evaluateCompatibility(
    catalog.products,
    scenarioPresets[0].requirements,
  );
  const featuredProduct = featuredResult.primaryRecommendation?.product;

  return (
    <>
      <FictionNotice />
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              AI-assisted sales engineering demo
            </Badge>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              From an operational problem to a{" "}
              <span className="text-primary">grounded tank-monitoring fit.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Explore a synthetic product catalog, describe a fictional application, and see how deterministic rules keep compatibility separate from AI conversation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/demo">
                  Run the AirFlame journey <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/catalog">Browse all 13 products</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-border/70 pt-6">
              <div>
                <dt className="text-xs text-muted-foreground">Catalog</dt>
                <dd className="mt-1 font-mono text-sm sm:text-lg">13 products</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Rule set</dt>
                <dd className="mt-1 font-mono text-sm sm:text-lg">v{featuredResult.ruleVersion}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Data</dt>
                <dd className="mt-1 font-mono text-sm sm:text-lg">100% synthetic</dd>
              </div>
            </dl>
          </div>

          {featuredProduct ? (
            <Card className="relative overflow-hidden border-primary/20 bg-card/90 p-0 shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    Rules engine result
                  </span>
                </div>
                <Badge className="bg-emerald-400/15 text-emerald-300">Compatible</Badge>
              </div>
              <div className="grid sm:grid-cols-[0.9fr_1.1fr] lg:grid-cols-1 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="relative aspect-square bg-muted/40">
                  <Image
                    src={featuredProduct.image.path}
                    alt={featuredProduct.image.alt}
                    fill
                    priority
                    loading="eager"
                    sizes="(max-width: 1024px) 45vw, 24vw"
                    className="object-cover"
                  />
                </div>
                <CardContent className="flex flex-col justify-center p-6">
                  <p className="font-mono text-xs text-primary">{featuredProduct.id}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{featuredProduct.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Recommended for the distributed AirFlame heating-oil pilot using confirmed float gauges and LTE-M.
                  </p>
                  <div className="mt-5 space-y-2 text-sm">
                    {featuredResult.primaryRecommendation?.matchedFields.slice(0, 4).map((field) => (
                      <div key={field} className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-emerald-400" />
                        <span className="font-mono text-xs text-muted-foreground">{field}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Two-layer architecture</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Conversation can be flexible. Technical truth cannot.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: Bot, title: "Multilingual conversation", text: "The AI layer interprets needs and explains grounded results in the visitor’s language." },
            { icon: Database, title: "Structured catalog", text: "Product claims come from versioned synthetic records, never from model memory." },
            { icon: ShieldCheck, title: "Deterministic controls", text: "Compatibility, calculations, orders, and approval states remain under application code." },
          ].map((item) => (
            <Card key={item.title} className="bg-card/60">
              <CardContent>
                <item.icon className="size-5 text-primary" />
                <h3 className="mt-5 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Editable starting points</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Three presets, one rules pipeline</h2>
            </div>
            <Button asChild variant="ghost">
              <Link href="/advisor">Open advisor <ArrowRight data-icon="inline-end" /></Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {scenarioPresets.map((preset) => (
              <Link key={preset.id} href={`/advisor?preset=${preset.id}`} className="group">
                <Card className="h-full bg-background/70 transition-colors group-hover:border-primary/50">
                  <CardContent>
                    <Image src={preset.logoPath} alt="" width={48} height={48} />
                    <p className="mt-5 text-sm text-primary">{preset.company}</p>
                    <h3 className="mt-1 text-lg font-semibold">{preset.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{preset.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Catalog preview</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Built for materially different applications</h2>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/catalog">View catalog</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {catalog.products.slice(0, 3).map((product, index) => (
            <ProductCard key={product.id} product={product} eager={index === 0} />
          ))}
        </div>
      </section>
    </>
  );
}
