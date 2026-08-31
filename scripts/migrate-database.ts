import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

nextEnv.loadEnvConfig(process.cwd(), true);

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");

const db = drizzle(neon(databaseUrl));
await migrate(db, { migrationsFolder: "drizzle" });
console.log("Database migrations completed.");
