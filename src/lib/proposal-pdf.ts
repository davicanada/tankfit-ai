import "server-only";
import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { airFlameRequirementsSchema, roiAssumptionsSchema, type RoiResult } from "@/domain/journey/types";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;

type ProposalInput = {
  proposalId: string;
  orderId: string;
  generatedAt: Date;
  requirements: unknown;
  roiAssumptions: unknown;
  roiResult: RoiResult | null;
  quantity: number;
  productId: string;
  productName: string;
  currency: string;
  catalogVersion: string;
  commerceVersion: string;
  compatibilityRuleVersion: string;
  unitPriceCents: number;
  monthlyServiceCents: number;
  hardwareSubtotalCents: number;
  fictionalDepositCents: number;
  leadTimeBusinessDays: number;
  decisionNote: string | null;
};

function currency(cents: number) {
  return `CAD ${(cents / 100).toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function decimalCurrency(value: number) {
  return `CAD ${value.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.replace(/[^\x20-\x7E]/g, "-").split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawTextBlock(
  page: PDFPage,
  text: string,
  options: {
    x: number;
    y: number;
    width: number;
    font: PDFFont;
    size?: number;
    color?: ReturnType<typeof rgb>;
    lineHeight?: number;
  },
) {
  const size = options.size ?? 10;
  const lineHeight = options.lineHeight ?? size * 1.45;
  const lines = wrapText(text, options.font, size, options.width);
  lines.forEach((line, index) => {
    page.drawText(line, {
      x: options.x,
      y: options.y - index * lineHeight,
      size,
      font: options.font,
      color: options.color ?? rgb(0.25, 0.31, 0.34),
    });
  });
  return options.y - lines.length * lineHeight;
}

function decoratePage(input: {
  page: PDFPage;
  pageNumber: number;
  totalPages: number;
  regular: PDFFont;
  bold: PDFFont;
  proposalId: string;
}) {
  const { page, pageNumber, totalPages, regular, bold, proposalId } = input;
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 14, width: PAGE_WIDTH, height: 14, color: rgb(0.04, 0.48, 0.48) });
  page.drawText("TANKFIT AI", { x: MARGIN, y: PAGE_HEIGHT - 48, size: 11, font: bold, color: rgb(0.04, 0.48, 0.48) });
  page.drawText("DEMO - NOT A VALID QUOTE", {
    x: 95,
    y: 315,
    size: 38,
    font: bold,
    color: rgb(0.78, 0.84, 0.84),
    rotate: degrees(34),
    opacity: 0.16,
  });
  page.drawLine({ start: { x: MARGIN, y: 45 }, end: { x: PAGE_WIDTH - MARGIN, y: 45 }, thickness: 0.6, color: rgb(0.78, 0.82, 0.83) });
  page.drawText(`Proposal ${proposalId.slice(0, 8)} | Page ${pageNumber} of ${totalPages}`, { x: MARGIN, y: 27, size: 8, font: regular, color: rgb(0.42, 0.47, 0.49) });
  page.drawText("Synthetic demo - not a valid quote or contract.", { x: 330, y: 27, size: 8, font: regular, color: rgb(0.42, 0.47, 0.49) });
}

function drawLabelValue(page: PDFPage, input: { label: string; value: string; y: number; regular: PDFFont; bold: PDFFont }) {
  page.drawText(input.label, { x: MARGIN, y: input.y, size: 9, font: input.regular, color: rgb(0.42, 0.47, 0.49) });
  page.drawText(input.value, { x: 250, y: input.y, size: 10, font: input.bold, color: rgb(0.13, 0.18, 0.2) });
}

export async function createProposalPdf(input: ProposalInput) {
  const requirements = airFlameRequirementsSchema.parse(input.requirements);
  const assumptions = roiAssumptionsSchema.parse(input.roiAssumptions);
  const document = await PDFDocument.create();
  document.setTitle(`TankFit AI fictional proposal ${input.proposalId.slice(0, 8)}`);
  document.setAuthor("Davi Almeida");
  document.setSubject("Synthetic proposal generated for the Jornada de Dados competition");
  document.setCreator("TankFit AI");
  document.setCreationDate(input.generatedAt);

  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const pages = [document.addPage([PAGE_WIDTH, PAGE_HEIGHT]), document.addPage([PAGE_WIDTH, PAGE_HEIGHT])];
  pages.forEach((page, index) => decoratePage({ page, pageNumber: index + 1, totalPages: pages.length, regular, bold, proposalId: input.proposalId }));

  const first = pages[0];
  first.drawText("FICTIONAL PILOT PROPOSAL", { x: MARGIN, y: 690, size: 11, font: bold, color: rgb(0.04, 0.48, 0.48) });
  first.drawText(`${requirements.companyName} tank-monitoring pilot`, { x: MARGIN, y: 652, size: 25, font: bold, color: rgb(0.1, 0.16, 0.18) });
  first.drawText(`Approved ${input.generatedAt.toISOString().slice(0, 10)} | Order ${input.orderId.slice(0, 8)}`, { x: MARGIN, y: 628, size: 9, font: regular, color: rgb(0.42, 0.47, 0.49) });

  let y = 580;
  first.drawText("Recommended pilot", { x: MARGIN, y, size: 14, font: bold, color: rgb(0.1, 0.16, 0.18) });
  y -= 28;
  drawLabelValue(first, { label: "Product", value: `${input.productName} (${input.productId})`, y, regular, bold });
  y -= 24;
  drawLabelValue(first, { label: "Pilot quantity", value: `${input.quantity} units`, y, regular, bold });
  y -= 24;
  drawLabelValue(first, { label: "Hardware subtotal", value: currency(input.hardwareSubtotalCents), y, regular, bold });
  y -= 24;
  drawLabelValue(first, { label: "Monthly service", value: currency(input.monthlyServiceCents * input.quantity), y, regular, bold });
  y -= 24;
  drawLabelValue(first, { label: "Fictional deposit", value: currency(input.fictionalDepositCents), y, regular, bold });
  y -= 24;
  drawLabelValue(first, { label: "Estimated lead time", value: `${input.leadTimeBusinessDays} business days`, y, regular, bold });
  y -= 36;
  first.drawText("Confirmed application", { x: MARGIN, y, size: 14, font: bold, color: rgb(0.1, 0.16, 0.18) });
  y -= 28;
  y = drawTextBlock(first, `${requirements.fleetSize} distributed above-ground horizontal heating-oil tanks using mechanical float gauges, confirmed adapter compatibility, LTE-M connectivity, daily readings, and low-level alerts. Operating range: ${requirements.minimumTemperatureC} C to ${requirements.maximumTemperatureC} C.`, { x: MARGIN, y, width: PAGE_WIDTH - MARGIN * 2, font: regular, size: 10 });
  y -= 24;
  first.drawText("Human approval note", { x: MARGIN, y, size: 14, font: bold, color: rgb(0.1, 0.16, 0.18) });
  y -= 25;
  drawTextBlock(first, input.decisionNote || "Approved for the fictional five-site pilot.", { x: MARGIN, y, width: PAGE_WIDTH - MARGIN * 2, font: regular, size: 10 });
  first.drawText(`Catalog ${input.catalogVersion} | Rules ${input.compatibilityRuleVersion} | Commerce ${input.commerceVersion}`, { x: MARGIN, y: 72, size: 8, font: regular, color: rgb(0.42, 0.47, 0.49) });

  const second = pages[1];
  second.drawText("BUSINESS CASE AND DEMO TERMS", { x: MARGIN, y: 690, size: 11, font: bold, color: rgb(0.04, 0.48, 0.48) });
  second.drawText("Transparent assumptions", { x: MARGIN, y: 652, size: 24, font: bold, color: rgb(0.1, 0.16, 0.18) });
  y = 606;
  const rows: Array<[string, string]> = [
    ["Annual runouts", `${assumptions.annualRunouts} at CAD ${assumptions.costPerRunoutCad} each; ${assumptions.runoutReductionPercent}% reduction`],
    ["Emergency deliveries", `${assumptions.annualEmergencyDeliveries} at CAD ${assumptions.incrementalEmergencyCostCad} extra; ${assumptions.emergencyReductionPercent}% reduction`],
    ["Manual checks", `${assumptions.annualManualChecks} at CAD ${assumptions.costPerManualCheckCad} each; ${assumptions.manualCheckReductionPercent}% reduction`],
  ];
  for (const [label, value] of rows) {
    drawLabelValue(second, { label, value, y, regular, bold });
    y -= 32;
  }
  if (input.roiResult) {
    y -= 12;
    second.drawText("Deterministic estimate", { x: MARGIN, y, size: 14, font: bold, color: rgb(0.1, 0.16, 0.18) });
    y -= 28;
    drawLabelValue(second, { label: "Annual benefit", value: decimalCurrency(input.roiResult.estimatedAnnualBenefitCad), y, regular, bold });
    y -= 24;
    drawLabelValue(second, { label: "First-year fleet cost", value: decimalCurrency(input.roiResult.estimatedFirstYearRolloutCostCad), y, regular, bold });
    y -= 24;
    drawLabelValue(second, { label: "Estimated payback", value: input.roiResult.estimatedPaybackMonths === null ? "Not available" : `${input.roiResult.estimatedPaybackMonths} months`, y, regular, bold });
  }
  y -= 50;
  second.drawText("Important demo terms", { x: MARGIN, y, size: 14, font: bold, color: rgb(0.1, 0.16, 0.18) });
  y -= 28;
  const terms = [
    "This document is generated from synthetic data for a personal, independent competition project.",
    "Tankroy Systems Inc., AirFlame Fuels, every product, price, stock value, metric, payment, and approval are fictional.",
    "The deposit authorization is an internal simulation. No payment processor or real money is involved.",
    "Compatibility and ROI are educational demonstrations, not engineering, safety, financial, or commercial advice.",
  ];
  for (const term of terms) {
    second.drawCircle({ x: MARGIN + 3, y: y + 3, size: 2, color: rgb(0.04, 0.48, 0.48) });
    y = drawTextBlock(second, term, { x: MARGIN + 14, y: y + 7, width: PAGE_WIDTH - MARGIN * 2 - 14, font: regular, size: 9.5 });
    y -= 10;
  }

  return document.save();
}
