ALTER TABLE "demo_sessions" ADD COLUMN "sales_requested" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "demo_sessions" ADD COLUMN "business_brief" jsonb DEFAULT '{"objective":"","timeline":"","successCriteria":""}'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "demo_orders" ADD COLUMN "workflow_version" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "demo_orders" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "demo_orders" ADD COLUMN "accepted_at" timestamp with time zone;
