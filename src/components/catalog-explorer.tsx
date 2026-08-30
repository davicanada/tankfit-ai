"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { humanizeCatalogValue, type Product } from "@/lib/catalog";

export function CatalogExplorer({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [productType, setProductType] = useState("all");
  const [material, setMaterial] = useState("all");

  const productTypes = useMemo(
    () => [...new Set(products.map((product) => product.productType))],
    [products],
  );
  const materials = useMemo(
    () => [
      ...new Set(
        products
          .flatMap((product) => product.supportedMaterials)
          .filter((value) => value !== "not_applicable"),
      ),
    ],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [product.name, product.id, product.family, product.tagline]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesType = productType === "all" || product.productType === productType;
      const matchesMaterial =
        material === "all" || product.supportedMaterials.includes(material);

      return matchesQuery && matchesType && matchesMaterial;
    });
  }, [material, productType, products, query]);

  return (
    <div>
      <div className="grid gap-4 rounded-xl border border-border/80 bg-card/60 p-4 md:grid-cols-[1fr_240px_240px]">
        <div>
          <Label htmlFor="catalog-search">Search catalog</Label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="catalog-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Product, family, or ID"
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="product-type-filter">Product type</Label>
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger id="product-type-filter" className="mt-2 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All product types</SelectItem>
              {productTypes.map((type) => (
                <SelectItem key={type} value={type}>{humanizeCatalogValue(type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="material-filter">Stored material</Label>
          <Select value={material} onValueChange={setMaterial}>
            <SelectTrigger id="material-filter" className="mt-2 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All materials</SelectItem>
              {materials.map((value) => (
                <SelectItem key={value} value={value}>{humanizeCatalogValue(value)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <p>{filteredProducts.length} of {products.length} fictional products</p>
        <p className="font-mono text-xs">Static JSON fallback active</p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} eager={index === 0} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="font-medium">No products match these filters.</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a broader product type or stored material.</p>
        </div>
      )}
    </div>
  );
}
