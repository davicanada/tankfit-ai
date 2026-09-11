import { test, expect } from "@playwright/test";

async function fillCompatibleCustomScenario(page: import("@playwright/test").Page) {
  await page
    .getByLabel("Fictional organization", { exact: true })
    .fill("Northstar Fictional Fuels");
  const selects = [
    ["Material", "heating_oil"],
    ["Tank Type", "above_ground_horizontal"],
    ["Existing Instrumentation", "mechanical_float_gauge"],
    ["Gauge Interface", "confirmed_compatible"],
    ["Connectivity", "lte_m"],
    ["Site Distribution", "distributed"],
    ["Measurement Preference", "existing_float_gauge_interface"],
    ["Reading Frequency", "daily"],
    ["Low Level Alerts", "true"],
    ["Regulated Location", "false"],
  ] as const;
  for (const [label, value] of selects) {
    await page
      .getByRole("combobox", { name: label, exact: true })
      .selectOption(value);
  }
  await page.getByLabel("Fleet Size", { exact: true }).fill("500");
  await page.getByLabel("Pilot Quantity", { exact: true }).fill("5");
  await page.getByLabel("Minimum Temperature C", { exact: true }).fill("-25");
  await page.getByLabel("Maximum Temperature C", { exact: true }).fill("35");
}

test.beforeEach(() => {
  test.skip(
    process.env.E2E_DATABASE !== "1",
    "Requires the configured demo database and signing secret.",
  );
});

test("custom scenario review, revision, approval, proposal and acceptance precede checkout", async ({
  page,
  browser,
}) => {
  await page.goto("/demo/customer");
  const reset = () =>
    page.getByRole("button", { name: "Reset demo", exact: true }).first();
  await expect(reset()).toBeVisible({ timeout: 20000 });
  try {
    await fillCompatibleCustomScenario(page);
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

test("discovery preserves an explicitly written pilot quantity", async ({
  page,
}) => {
  await page.goto("/demo/customer");
  const reset = page
    .getByRole("button", { name: "Reset demo", exact: true })
    .first();
  await expect(reset).toBeVisible({ timeout: 20000 });
  try {
    await page
      .getByRole("textbox", { name: "Message to TankFit AI" })
      .fill(
        "We manage 500 rural heating-oil tanks with float gauges. We want fewer run-outs and a five-tank pilot.",
      );
    await page.getByRole("button", { name: "Send message", exact: true }).click();
    await expect(
      page.getByRole("spinbutton", { name: "Pilot Quantity", exact: true }),
    ).toHaveValue("5", { timeout: 20000 });
  } finally {
    if (await reset.isVisible()) await reset.click();
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
      page.getByRole("button", { name: /Load prepared .* opportunity/ }),
    ).toHaveCount(0);
  } finally {
    const reset = page
      .getByRole("button", { name: "Reset demo", exact: true })
      .first();
    if (await reset.isVisible()) await reset.click();
  }
});
