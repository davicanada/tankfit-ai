import "server-only";
import { neon, Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as transactionalDrizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

function createDb() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");
  return drizzle(neon(databaseUrl), { schema });
}

let database: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!database) database = createDb();
  return database;
}

let transactionalDatabase: ReturnType<typeof createTransactionalDb> | null =
  null;
function createTransactionalDb() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  neonConfig.webSocketConstructor = WebSocket;
  const pool = new Pool({
    connectionString,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
  return transactionalDrizzle(pool, { schema });
}
export function getTransactionalDb() {
  return (transactionalDatabase ??= createTransactionalDb());
}
