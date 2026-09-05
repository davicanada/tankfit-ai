import { createHash } from "node:crypto";

// Separate deployment cookies when independent preview runs overlap.
export const previewAuthPath = `tmp/e2e/auth-${createHash("sha256")
  .update(process.env.E2E_BASE_URL ?? "local")
  .digest("hex")
  .slice(0, 12)}.json`;
