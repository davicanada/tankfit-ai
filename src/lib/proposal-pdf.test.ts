import { PDFDocument } from "pdf-lib";
import { mkdir, writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  defaultAirFlameRequirements,
  defaultRoiAssumptions,
} from "@/domain/journey/types";
import { createProposalPdf } from "./proposal-pdf";

describe("createProposalPdf", () => {
  it.each(["AirFlame Fuels", "W".repeat(80), "虚构企业 Demonstration"])(
    "creates a bounded two-page fictional proposal for %s",
    async (companyName) => {
      const bytes = await createProposalPdf({
        proposalId: "00000000-0000-4000-8000-000000000001",
        orderId: "00000000-0000-4000-8000-000000000002",
        generatedAt: new Date("2026-08-30T12:00:00.000Z"),
        requirements: { ...defaultAirFlameRequirements, companyName },
        roiAssumptions: defaultRoiAssumptions,
        roiResult: {
          avoidedRunoutCostCad: 4608,
          avoidedEmergencyCostCad: 4200,
          avoidedManualCheckCostCad: 15120,
          estimatedAnnualBenefitCad: 23928,
          estimatedFirstYearRolloutCostCad: 118500,
          estimatedFirstYearNetCad: -94572,
          estimatedPaybackMonths: 59.43,
        },
        quantity: 5,
        productId: "TR-FL100",
        productName: "FloatLink FL-100",
        currency: "CAD",
        catalogVersion: "2026.08.1",
        commerceVersion: "2026.08.1",
        compatibilityRuleVersion: "2026.08.1",
        unitPriceCents: 18900,
        monthlyServiceCents: 400,
        hardwareSubtotalCents: 94500,
        fictionalDepositCents: 25000,
        leadTimeBusinessDays: 3,
        decisionNote: "Synthetic approval. ".repeat(25),
      });
      const document = await PDFDocument.load(bytes);
      expect(document.getPageCount()).toBe(2);
      expect(Buffer.from(bytes).subarray(0, 4).toString()).toBe("%PDF");
      if (process.env.PDF_VISUAL_QA === "1") {
        await mkdir("tmp/pdfs", { recursive: true });
        const name =
          companyName === "AirFlame Fuels"
            ? "airflame"
            : companyName.startsWith("W")
              ? "long-name"
              : "unicode";
        await writeFile(`tmp/pdfs/${name}.pdf`, bytes);
      }
    },
  );
});
