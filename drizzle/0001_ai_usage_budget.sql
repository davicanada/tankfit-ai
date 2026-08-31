CREATE TABLE IF NOT EXISTS "ai_usage_daily" (
  "day" date NOT NULL,
  "kind" text NOT NULL CHECK ("kind" IN ('advisor', 'discovery')),
  "request_count" integer DEFAULT 0 NOT NULL CHECK ("request_count" >= 0),
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "ai_usage_daily_day_kind_pk" PRIMARY KEY ("day", "kind")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demo_events_type_created_idx" ON "demo_events" ("event_type", "created_at");
