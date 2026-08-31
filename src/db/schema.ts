import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type {
  AirFlameRequirements,
  RoiAssumptions,
  RoiResult,
} from "@/domain/journey/types";

export const commerceItems = pgTable("commerce_items", {
  productId: text("product_id").primaryKey(),
  commerceVersion: text("commerce_version").notNull(),
  currency: text("currency").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  monthlyServiceCents: integer("monthly_service_cents").notNull(),
  stockQuantity: integer("stock_quantity").notNull(),
  availability: text("availability").notNull(),
  leadTimeBusinessDays: integer("lead_time_business_days").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const demoSessions = pgTable(
  "demo_sessions",
  {
    id: text("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    requirements: jsonb("requirements").$type<AirFlameRequirements>().notNull(),
    requirementsConfirmed: boolean("requirements_confirmed")
      .default(false)
      .notNull(),
    recommendationStatus: text("recommendation_status"),
    recommendationProductId: text("recommendation_product_id"),
    recommendationRuleVersion: text("recommendation_rule_version"),
    recommendationReasons: jsonb("recommendation_reasons").$type<string[]>(),
    roiAssumptions: jsonb("roi_assumptions").$type<RoiAssumptions>().notNull(),
    roiResult: jsonb("roi_result").$type<RoiResult>(),
  },
  (table) => [index("demo_sessions_expires_at_idx").on(table.expiresAt)],
);

export const demoOrders = pgTable(
  "demo_orders",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => demoSessions.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    productId: text("product_id").notNull(),
    quantity: integer("quantity").notNull(),
    currency: text("currency").notNull(),
    commerceVersion: text("commerce_version").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    monthlyServiceCents: integer("monthly_service_cents").notNull(),
    hardwareSubtotalCents: integer("hardware_subtotal_cents").notNull(),
    fictionalDepositCents: integer("fictional_deposit_cents").notNull(),
    leadTimeBusinessDays: integer("lead_time_business_days").notNull(),
    decisionNote: text("decision_note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    checkoutCompletedAt: timestamp("checkout_completed_at", {
      withTimezone: true,
    }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
  },
  (table) => [
    index("demo_orders_session_id_idx").on(table.sessionId),
    index("demo_orders_status_idx").on(table.status),
  ],
);

export const demoEvents = pgTable(
  "demo_events",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => demoSessions.id, { onDelete: "cascade" }),
    orderId: text("order_id").references(() => demoOrders.id, {
      onDelete: "cascade",
    }),
    eventType: text("event_type").notNull(),
    actor: text("actor").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("demo_events_session_id_idx").on(table.sessionId),
    index("demo_events_order_id_idx").on(table.orderId),
    index("demo_events_type_created_idx").on(table.eventType, table.createdAt),
  ],
);

export const demoProposals = pgTable(
  "demo_proposals",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => demoOrders.id, { onDelete: "cascade" }),
    sessionId: text("session_id")
      .notNull()
      .references(() => demoSessions.id, { onDelete: "cascade" }),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("demo_proposals_session_id_idx").on(table.sessionId)],
);

export const aiUsageDaily = pgTable(
  "ai_usage_daily",
  {
    day: date("day").notNull(),
    kind: text("kind").notNull(),
    requestCount: integer("request_count").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.day, table.kind] })],
);
