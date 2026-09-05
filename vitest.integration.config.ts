import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

const environment = loadEnv("development", process.cwd(), "");
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./src/test/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        process.env.DATABASE_URL ??
        environment.DATABASE_URL ??
        "",
    },
    include: ["integration/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
