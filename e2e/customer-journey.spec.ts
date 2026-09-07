import { test, expect } from "@playwright/test";

test.beforeEach(() => {
  test.skip(
    process.env.E2E_DATABASE !== "1",
    "Requires the configured demo database and signing secret.",
  );
});

test("AirFlame review, revision, approval, proposal and acceptance precede checkout", async ({
  page,
  browser,
}) => {
  await page.goto("/demo/customer");
  const reset = () =>
    page.getByRole("button", { name: "Reset demo", exact: true }).first();
  await expect(reset()).toBeVisible({ timeout: 20000 });
  try {
    await page
      .getByRole("button", { name: "AirFlame Fuels", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Business objective" })
      .fill("Reduce unnecessary manual checks");
    await page
      .getByRole("button", { name: "Confirm requirements", exact: true })
      .click();
    await expect(page.getByText(/Simple payback: Not reached/)).toBeVisible({
      timeout: 20000,
    });
    await page
      .getByRole("button", {
        name: "Submit pilot for Sales review",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: /Pilot request · Pending Approval · Revision 1/,
      }),
    ).toBeVisible({ timeout: 20000 });
    await expect(
      page.getByRole("button", { name: "Open Stripe test checkout" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Download fictional proposal" }),
    ).toHaveCount(0);
    await page
      .getByRole("link", { name: "Continue in Sales Team Experience" })
      .click();
    await page.getByRole("button", { name: "Enter Demo Staff Mode" }).click();
    await page
      .getByRole("textbox", { name: "Decision note" })
      .fill("Please review the pilot facts before resubmission.");
    await page
      .getByRole("button", { name: "Changes Requested", exact: true })
      .click();
    await page
      .getByRole("link", { name: "Return to customer for revision" })
      .click();
    await page
      .getByRole("button", { name: "Revise request", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Confirm requirements", exact: true }),
    ).toBeEnabled();
    await expect(
      page.getByRole("textbox", { name: "Message to TankFit AI" }),
    ).toBeEnabled();
    await page
      .getByRole("button", { name: "Confirm requirements", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Submit pilot for Sales review",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: /Pilot request · Pending Approval · Revision 2/,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Revision history" }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Continue in Sales Team Experience" })
      .click();
    await page.getByRole("button", { name: "Enter Demo Staff Mode" }).click();
    await page
      .getByRole("textbox", { name: "Decision note" })
      .fill("Synthetic five-site pilot approved for evaluation.");
    await page
      .getByRole("button", { name: "Approve pilot", exact: true })
      .click();
    const proposal = page.getByRole("link", {
      name: "Download fictional proposal",
    });
    await expect(proposal).toBeVisible({ timeout: 20000 });
    const href = await proposal.getAttribute("href");
    const pdf = await page.request.get(href!);
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()["content-type"]).toContain("application/pdf");
    const stranger = await browser.newContext();
    try {
      expect(
        (await stranger.request.get(new URL(href!, page.url()).href)).status(),
      ).toBe(404);
    } finally {
      await stranger.close();
    }
    await page.getByRole("link", { name: "Continue as customer" }).click();
    await expect(
      page.getByRole("button", { name: "Open Stripe test checkout" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Accept proposal", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: /Pilot request · Accepted/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open Stripe test checkout" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Revise request", exact: true }),
    ).toHaveCount(0);
  } finally {
    if (await reset().isVisible()) await reset().click();
  }
});

test("a novice can request Sales help with unknown technical facts", async ({
  page,
}) => {
  await page.goto("/demo/customer");
  await expect(
    page.getByRole("button", { name: "Request Sales help", exact: true }),
  ).toBeEnabled({ timeout: 20000 });
  try {
    await page
      .getByRole("textbox", { name: "Business objective" })
      .fill("I want fewer manual tank checks but do not know the sensor type.");
    await page
      .getByRole("button", { name: "Request Sales help", exact: true })
      .click();
    await expect(
      page.getByText(
        "Opportunity saved for the Sales demonstration. No staff notification is sent.",
      ),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Continue in Sales Team Experience" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Opportunity brief" }),
    ).toBeVisible();
    await expect(
      page.getByText(/I want fewer manual tank checks/),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Enter Demo Staff Mode" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Open Stripe test checkout" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Load prepared AirFlame opportunity" }),
    ).toHaveCount(0);
  } finally {
    const reset = page
      .getByRole("button", { name: "Reset demo", exact: true })
      .first();
    if (await reset.isVisible()) await reset.click();
  }
});
