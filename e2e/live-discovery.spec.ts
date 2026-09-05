import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

// Synthetic fixtures in the visitor's language; UI, code and documentation stay English.
const cases = [
  [
    "English",
    "My fictional business stores water in tanks. What information do you need to recommend monitoring?",
  ],
  [
    "French",
    "Mon entreprise fictive stocke de l'eau dans des réservoirs. Quelles informations faut-il pour recommander une surveillance ?",
  ],
  [
    "Spanish",
    "Mi empresa ficticia almacena agua en tanques. ¿Qué información necesitas para recomendar un sistema de monitoreo?",
  ],
  [
    "Italian",
    "La mia azienda fittizia conserva acqua in serbatoi. Quali informazioni servono per consigliare un sistema di monitoraggio?",
  ],
  [
    "German",
    "Mein fiktives Unternehmen lagert Wasser in Tanks. Welche Informationen brauchst du, um eine Überwachung zu empfehlen?",
  ],
  [
    "Polish",
    "Moja fikcyjna firma przechowuje wodę w zbiornikach. Jakich informacji potrzebujesz, aby polecić monitorowanie?",
  ],
  [
    "Portuguese",
    "Minha empresa fictícia armazena água em tanques. Quais informações você precisa para recomendar monitoramento?",
  ],
  ["Chinese", "我的虚构公司在储罐中存储水。你需要哪些信息才能推荐监测方案？"],
  [
    "Hindi",
    "मेरी काल्पनिक कंपनी टैंकों में पानी रखती है। निगरानी की सलाह देने के लिए आपको कौन सी जानकारी चाहिए?",
  ],
];

for (const [language, message] of cases) {
  test(`capture live ${language} discovery and reject premature qualification`, async ({
    page,
  }, testInfo) => {
    test.skip(
      process.env.E2E_LIVE_AI !== "1" || testInfo.project.name !== "chromium",
      "Explicit live-provider opt-in; run one copy per language.",
    );
    await page.goto("/demo/customer");
    const reset = page.getByRole("button", { name: "Reset demo", exact: true });
    await expect(reset).toBeVisible({ timeout: 20000 });
    try {
      // Respect the production six-per-minute burst limit; never disable it.
      await new Promise((resolve) => setTimeout(resolve, 11000));
      const result = await page.evaluate(async (message) => {
        const response = await fetch("/api/discovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        return { status: response.status, body: await response.json() };
      }, message);
      await testInfo.attach("synthetic-live-response", {
        body: JSON.stringify(result, null, 2),
        contentType: "application/json",
      });
      await mkdir(testInfo.outputDir, { recursive: true });
      await writeFile(
        testInfo.outputPath("response.json"),
        JSON.stringify(result, null, 2),
      );
      expect(result.status).toBe(200);
      expect(result.body.requirements.material).toBe("water");
      expect(result.body.requirements.gaugeInterface).toBe("unknown");
      expect(result.body.requirements.minimumTemperatureC).toBeNull();
      expect(result.body.messages.at(-1)?.content.length).toBeGreaterThan(10);
      // Language, grounding and refusal quality still require semantic review
      // of the captured answer; HTTP success alone is not that review.
      await page.goto("/demo/sales");
      await expect(
        page.getByRole("button", { name: "Approve pilot" }),
      ).toHaveCount(0);
      await testInfo.attach("session-audit", {
        body: await page.locator("main").innerText(),
        contentType: "text/plain",
      });
      await writeFile(
        testInfo.outputPath("audit.txt"),
        await page.locator("main").innerText(),
      );
    } finally {
      if (await reset.isVisible()) await reset.click();
    }
  });
}
