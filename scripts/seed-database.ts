import commerceJson from "../data/catalog/demo-commerce.json";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import nextEnv from "@next/env";
import { commerceItems } from "../src/db/schema";

nextEnv.loadEnvConfig(process.cwd(), true);

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");

const db = drizzle(neon(databaseUrl));

for (const item of commerceJson.items) {
  await db
    .insert(commerceItems)
    .values({
      productId: item.productId,
      commerceVersion: commerceJson.commerceVersion,
      currency: commerceJson.currency,
      unitPriceCents: Math.round(item.unitPriceCad * 100),
      monthlyServiceCents: Math.round(item.monthlyServiceCad * 100),
      stockQuantity: item.stockQuantity,
      availability: item.availability,
      leadTimeBusinessDays: item.leadTimeBusinessDays,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: commerceItems.productId,
      set: {
        commerceVersion: commerceJson.commerceVersion,
        currency: commerceJson.currency,
        unitPriceCents: Math.round(item.unitPriceCad * 100),
        monthlyServiceCents: Math.round(item.monthlyServiceCad * 100),
        stockQuantity: item.stockQuantity,
        availability: item.availability,
        leadTimeBusinessDays: item.leadTimeBusinessDays,
        updatedAt: new Date(),
      },
    });
}

console.log(`Seeded ${commerceJson.items.length} synthetic commerce items.`);
