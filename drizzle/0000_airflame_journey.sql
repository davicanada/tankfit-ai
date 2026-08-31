CREATE TABLE IF NOT EXISTS "commerce_items" (
  "product_id" text PRIMARY KEY NOT NULL,
  "commerce_version" text NOT NULL,
  "currency" text NOT NULL,
  "unit_price_cents" integer NOT NULL CHECK ("unit_price_cents" >= 0),
  "monthly_service_cents" integer NOT NULL CHECK ("monthly_service_cents" >= 0),
  "stock_quantity" integer NOT NULL CHECK ("stock_quantity" >= 0),
  "availability" text NOT NULL CHECK ("availability" IN ('in_stock', 'limited', 'unavailable')),
  "lead_time_business_days" integer NOT NULL CHECK ("lead_time_business_days" >= 0),
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "demo_sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "requirements" jsonb NOT NULL,
  "requirements_confirmed" boolean DEFAULT false NOT NULL,
  "recommendation_status" text,
  "recommendation_product_id" text,
  "recommendation_rule_version" text,
  "recommendation_reasons" jsonb,
  "roi_assumptions" jsonb NOT NULL,
  "roi_result" jsonb
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "demo_orders" (
  "id" text PRIMARY KEY NOT NULL,
  "session_id" text NOT NULL REFERENCES "demo_sessions"("id") ON DELETE CASCADE,
  "status" text NOT NULL CHECK ("status" IN ('draft', 'pending_approval', 'approved', 'changes_requested', 'rejected')),
  "product_id" text NOT NULL,
  "quantity" integer NOT NULL CHECK ("quantity" > 0),
  "currency" text NOT NULL CHECK ("currency" = 'CAD'),
  "unit_price_cents" integer NOT NULL CHECK ("unit_price_cents" >= 0),
  "monthly_service_cents" integer NOT NULL CHECK ("monthly_service_cents" >= 0),
  "hardware_subtotal_cents" integer NOT NULL CHECK ("hardware_subtotal_cents" >= 0),
  "fictional_deposit_cents" integer NOT NULL CHECK ("fictional_deposit_cents" >= 0),
  "decision_note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "checkout_completed_at" timestamp with time zone,
  "decided_at" timestamp with time zone
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "demo_events" (
  "id" text PRIMARY KEY NOT NULL,
  "session_id" text NOT NULL REFERENCES "demo_sessions"("id") ON DELETE CASCADE,
  "order_id" text REFERENCES "demo_orders"("id") ON DELETE CASCADE,
  "event_type" text NOT NULL,
  "actor" text NOT NULL CHECK ("actor" IN ('visitor', 'demo_staff', 'system')),
  "metadata" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "demo_proposals" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL UNIQUE REFERENCES "demo_orders"("id") ON DELETE CASCADE,
  "session_id" text NOT NULL REFERENCES "demo_sessions"("id") ON DELETE CASCADE,
  "generated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "demo_sessions_expires_at_idx" ON "demo_sessions" ("expires_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demo_orders_session_id_idx" ON "demo_orders" ("session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demo_orders_status_idx" ON "demo_orders" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demo_events_session_id_idx" ON "demo_events" ("session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demo_events_order_id_idx" ON "demo_events" ("order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demo_proposals_session_id_idx" ON "demo_proposals" ("session_id");
