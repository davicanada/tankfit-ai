ALTER TABLE demo_orders ADD COLUMN solution_snapshot jsonb;
--> statement-breakpoint
ALTER TABLE demo_orders ADD COLUMN checkout_session_id text;
--> statement-breakpoint
CREATE UNIQUE INDEX demo_orders_checkout_session_idx ON demo_orders(checkout_session_id) WHERE checkout_session_id IS NOT NULL;
--> statement-breakpoint
ALTER TABLE demo_sessions ADD COLUMN discovery_messages jsonb NOT NULL DEFAULT '[]';
