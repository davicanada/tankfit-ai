import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";

export type AiUsageKind = "advisor" | "discovery";

const dailyLimits: Record<AiUsageKind, number> = {
  advisor: 200,
  discovery: 100,
};

export async function reserveDailyAiRequest(kind: AiUsageKind) {
  const limit = dailyLimits[kind];
  const result = await getDb().execute(
    sql<{ request_count: number }>`
      INSERT INTO ai_usage_daily (day, kind, request_count, updated_at)
      VALUES (CURRENT_DATE, ${kind}, 1, now())
      ON CONFLICT (day, kind)
      DO UPDATE SET
        request_count = ai_usage_daily.request_count + 1,
        updated_at = now()
      WHERE ai_usage_daily.request_count < ${limit}
      RETURNING request_count
    `,
  );
  return result.rows.length === 1;
}
