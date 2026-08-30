import type { Metadata } from "next";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { FictionNotice } from "@/components/fiction-notice";
import { catalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Fictional product catalog",
  description: "Browse all synthetic Tankroy Systems monitoring products and compatibility attributes.",
};

export default function CatalogPage() {
  return (
    <>
      <FictionNotice compact />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Catalog {catalog.catalogVersion}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Fictional monitoring hardware, grounded in structured data.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Every claim below is read from the versioned catalog. Prices, stock, and delivery estimates are intentionally excluded until they can be revalidated against the application database.
          </p>
        </div>
        <div className="mt-10">
          <CatalogExplorer products={catalog.products} />
        </div>
      </div>
    </>
  );
}
