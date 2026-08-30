import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, TriangleAlert } from "lucide-react";
import { FictionNotice } from "@/components/fiction-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { catalog, getProductBySlug, humanizeCatalogValue } from "@/lib/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return catalog.products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.tagline };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <FictionNotice compact />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/catalog"><ArrowLeft data-icon="inline-start" /> Back to catalog</Link>
        </Button>

        <div className="mt-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted/50">
            <Image
              src={product.image.path}
              alt={product.image.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">{humanizeCatalogValue(product.productType)}</Badge>
              <span className="font-mono text-xs text-primary">{product.id}</span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{product.name}</h1>
            <p className="mt-4 text-lg text-primary">{product.tagline}</p>
            <p className="mt-5 leading-7 text-muted-foreground">{product.description}</p>

            <Separator className="my-8" />
            <dl className="grid gap-5 sm:grid-cols-2">
              {[
                ["Measurement", product.measurementMethod],
                ["Connectivity", product.connectivity.join(", ")],
                ["Supported materials", product.supportedMaterials.join(", ")],
                ["Last reviewed", product.lastReviewed],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-sm">{value.split(", ").map(humanizeCatalogValue).join(", ")}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link href="/advisor">Check an application</Link></Button>
              <Button variant="outline" size="lg" disabled>Draft order comes next</Button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Capabilities</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {product.capabilities.map((capability) => (
                <div key={capability} className="flex gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  <span>{humanizeCatalogValue(capability)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Installation summary</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-6 text-muted-foreground">{product.installationSummary}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Constraints</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {product.constraints.map((constraint) => (
                <div key={constraint} className="flex gap-3 text-sm">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-300" />
                  <span>{humanizeCatalogValue(constraint)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
