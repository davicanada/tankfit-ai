import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

export default async function setup() {
  if (!process.env.E2E_ACCESS_URL) return;
  const access = new URL(process.env.E2E_ACCESS_URL);
  if (access.origin !== new URL(process.env.E2E_BASE_URL!).origin)
    throw new Error("Preview access must match the test origin.");
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(access.href);
    await page.waitForURL(
      (url) =>
        url.origin === access.origin && !url.searchParams.has("_vercel_share"),
    );
    await mkdir("tmp/e2e", { recursive: true });
    await context.storageState({ path: "tmp/e2e/preview-auth.json" });
  } finally {
    await browser.close();
  }
}
