import { z } from "zod";
import { readSessionId } from "@/lib/demo-session";
import { getProposalData } from "@/lib/journey-service";
import { createProposalPdf } from "@/lib/proposal-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const proposalIdSchema = z.string().uuid();

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const sessionId = await readSessionId();
  const parsedId = proposalIdSchema.safeParse((await context.params).id);
  if (!sessionId || !parsedId.success) {
    return new Response("Not found", { status: 404 });
  }

  const data = await getProposalData(parsedId.data, sessionId);
  if (!data) return new Response("Not found", { status: 404 });

  const bytes = await createProposalPdf({
    proposalId: data.proposal.id,
    orderId: data.order.id,
    generatedAt: data.proposal.generatedAt,
    requirements: data.snapshot.requirements,
    roiAssumptions: data.snapshot.roiAssumptions,
    roiResult: data.snapshot.roi,
    quantity: data.order.quantity,
    productId: data.order.productId,
    productName: data.snapshot.productName,
    currency: data.order.currency,
    catalogVersion: data.snapshot.catalogVersion,
    commerceVersion: data.order.commerceVersion,
    compatibilityRuleVersion: data.snapshot.ruleVersion,
    unitPriceCents: data.order.unitPriceCents,
    monthlyServiceCents: data.order.monthlyServiceCents,
    hardwareSubtotalCents: data.order.hardwareSubtotalCents,
    fictionalDepositCents: data.order.fictionalDepositCents,
    leadTimeBusinessDays: data.order.leadTimeBusinessDays,
    decisionNote: data.order.decisionNote,
  });

  return new Response(Buffer.from(bytes), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `attachment; filename="tankfit-fictional-proposal-${data.order.id.slice(0, 8)}.pdf"`,
      "Content-Type": "application/pdf",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
