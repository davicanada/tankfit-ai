import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { defaultAirFlameRequirements, defaultRoiAssumptions } from "@/domain/journey/types";
import { createProposalPdf } from "./proposal-pdf";

describe("createProposalPdf", () => {
  it("creates a two-page fictional proposal", async () => {
    const bytes = await createProposalPdf({
      proposalId: "00000000-0000-4000-8000-000000000001",
      orderId: "00000000-0000-4000-8000-000000000002",
      generatedAt: new Date("2026-08-30T12:00:00.000Z"),
      requirements: defaultAirFlameRequirements,
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
      decisionNote: "Approved for the fictional pilot.",
    });
    const document = await PDFDocument.load(bytes);
    expect(document.getPageCount()).toBe(2);
    expect(Buffer.from(bytes).subarray(0, 4).toString()).toBe("%PDF");
  });
});
