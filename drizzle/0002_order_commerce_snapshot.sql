ALTER TABLE "demo_orders" ADD COLUMN IF NOT EXISTS "commerce_version" text DEFAULT '2026.08.1' NOT NULL;
--> statement-breakpoint
ALTER TABLE "demo_orders" ADD COLUMN IF NOT EXISTS "lead_time_business_days" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
UPDATE "demo_orders" AS orders
SET
  "commerce_version" = items."commerce_version",
  "lead_time_business_days" = items."lead_time_business_days"
FROM "commerce_items" AS items
WHERE orders."product_id" = items."product_id";
--> statement-breakpoint
ALTER TABLE "demo_orders" ALTER COLUMN "commerce_version" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "demo_orders" ALTER COLUMN "lead_time_business_days" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "demo_orders" ADD CONSTRAINT "demo_orders_lead_time_nonnegative" CHECK ("lead_time_business_days" >= 0);
