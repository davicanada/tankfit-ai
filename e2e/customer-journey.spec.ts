import { test, expect } from "@playwright/test";

// Explicit opt-in: this test creates only session-owned fictional database rows.
test("AirFlame confirmation, immutable draft and sales handoff", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_DATABASE !== "1",
    "Requires a configured isolated demo database and session signing secret.",
  );
  await page.goto("/demo/customer");
  const reset = page.getByRole("button", { name: "Reset demo", exact: true });
  await expect(reset).toBeVisible({ timeout: 20000 });
  try {
    await page
      .getByRole("button", { name: "AirFlame Fuels", exact: true })
      .click();
    await expect(page.getByText("Guided assessment: Compatible")).toBeVisible();
    await page
      .getByRole("button", { name: "Confirm requirements", exact: true })
      .click();
    const draft = page.getByRole("button", {
      name: "Create draft order",
      exact: true,
    });
    await expect(draft).toBeVisible({ timeout: 20000 });
    await draft.click();
    await expect(
      page.getByRole("heading", { name: "Pilot order · Draft" }),
    ).toBeVisible({ timeout: 20000 });
    await expect(
      page.getByRole("button", { name: "Confirm requirements", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Open Stripe test checkout" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Download fictional proposal" }),
    ).toHaveCount(0);
    await page.goto("/demo/sales");
    await expect(
      page.getByRole("heading", { name: "Pilot order · Draft" }),
    ).toBeVisible({ timeout: 20000 });
    await expect(
      page.getByRole("link", { name: "Complete test checkout as customer" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Approve pilot" }),
    ).toHaveCount(0);
  } finally {
    if (await reset.isVisible()) await reset.click();
    await expect(
      page.getByRole("heading", { name: "Pilot order · Draft" }),
    ).toHaveCount(0);
  }
});
