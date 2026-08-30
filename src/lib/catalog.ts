import catalogJson from "../../data/catalog/products.json";
import { z } from "zod";

const productImageSchema = z.object({
  path: z.string().startsWith("/images/products/"),
  alt: z.string().min(1),
});

export const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  family: z.string().min(1),
  productType: z.enum([
    "tank_monitor",
    "inventory_monitor",
    "gateway",
    "power_accessory",
    "display_accessory",
  ]),
  tagline: z.string().min(1),
  description: z.string().min(1),
  measurementMethod: z.string().min(1),
  supportedMaterials: z.array(z.string()),
  supportedTankTypes: z.array(z.string()),
  connectivity: z.array(z.string()),
  existingInstrumentation: z.array(z.string()),
  installationSummary: z.string().min(1),
  capabilities: z.array(z.string()),
  constraints: z.array(z.string()),
  compatibleAccessories: z.array(z.string()),
  image: productImageSchema,
  lastReviewed: z.string().date(),
  fictional: z.literal(true),
});

const catalogSchema = z.object({
  catalogVersion: z.string().min(1),
  lastReviewed: z.string().date(),
  disclaimer: z.string().min(1),
  products: z.array(productSchema).min(1),
});

export type Product = z.infer<typeof productSchema>;
export type ProductType = Product["productType"];

export const catalog = catalogSchema.parse(catalogJson);

export function getProductBySlug(slug: string) {
  return catalog.products.find((product) => product.slug === slug);
}

export function getProductsByIds(ids: string[]) {
  const idSet = new Set(ids);
  return catalog.products.filter((product) => idSet.has(product.id));
}

export function humanizeCatalogValue(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
