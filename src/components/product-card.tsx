import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { humanizeCatalogValue, type Product } from "@/lib/catalog";

export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  return (
    <Card className="group overflow-hidden border-border/80 bg-card/80 py-0 transition-colors hover:border-primary/50">
      <Link href={`/catalog/${product.slug}`} className="relative block aspect-square overflow-hidden bg-muted/60">
        <Image
          src={product.image.path}
          alt={product.image.alt}
          fill
          loading={eager ? "eager" : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <CardContent className="space-y-4 px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
              {product.id}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">{product.name}</h2>
          </div>
          <Badge variant="secondary">{humanizeCatalogValue(product.productType)}</Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{product.tagline}</p>
        <div className="flex flex-wrap gap-2">
          {product.supportedMaterials.slice(0, 3).map((material) => (
            <span key={material} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              {humanizeCatalogValue(material)}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-5 pb-5">
        <Link
          href={`/catalog/${product.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          View technical profile <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
