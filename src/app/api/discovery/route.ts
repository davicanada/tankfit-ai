import { z } from "zod";
import { readSessionId } from "@/lib/demo-session";
import {
  ensureDemoSession,
  requireDemoSession,
  saveDiscovery,
  recordSessionEvent,
} from "@/lib/journey-service";
import { extractAirFlameBrief } from "@/lib/ai/discovery";
import {
  boundAdvisorAnswer,
  buildAdvisorConversationContext,
} from "@/lib/ai/conversation-context";
import { evaluateJourney } from "@/domain/journey/evaluate";
import {
  generateAdvisorResponse,
  createDeterministicAdvisorReply,
} from "@/lib/ai/provider-router";
import { reserveDailyAiRequest } from "@/lib/ai/usage-budget";
import { consumeAdvisorRateLimit } from "@/lib/ai/rate-limit";
import {
  readBoundedJsonBody,
  validateAdvisorRequestHeaders,
} from "@/lib/ai/request-security";
import type { AdvisorMessage } from "@/lib/ai/types";

export const runtime = "nodejs";
export const maxDuration = 60;
const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

export async function GET() {
  if (!(await readSessionId()))
    return json({ messages: [], requirementsConfirmed: false });
  try {
    const session = await requireDemoSession();
    return json({
      messages: session.discoveryMessages,
      requirementsConfirmed: session.requirementsConfirmed,
    });
  } catch {
    return json({ messages: [], requirementsConfirmed: false });
  }
}

export async function POST(request: Request) {
  const failure = validateAdvisorRequestHeaders(request);
  if (failure) return json({ error: failure.message }, failure.status);
  if (!consumeAdvisorRateLimit(request).allowed)
    return json({ error: "Please wait before sending more messages." }, 429);
  const body = await readBoundedJsonBody(request);
  if (!body.ok)
    return json({ error: "Invalid or oversized body." }, body.status);
  const input = z
    .object({ message: z.string().trim().min(1).max(1200) })
    .strict()
    .safeParse(body.value);
  if (!input.success)
    return json({ error: "Use a short fictional message." }, 400);
  let stage = "ensure_session";
  try {
    await ensureDemoSession();
    stage = "read_session";
    const session = await requireDemoSession();
    if (session.requirementsConfirmed)
      return json(
        {
          error:
            "Requirements are confirmed. Continue the journey or reset to start over.",
        },
        409,
      );
    const content = input.data.message
      .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email omitted]")
      .replace(/(?:sk|rk)_(?:test|live)_\S+|AIza\S+/g, "[credential omitted]");
    const messages: AdvisorMessage[] = [
      ...session.discoveryMessages,
      { role: "user", content },
    ];
    const brief = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n");
    if (
      brief.length > 2000 ||
      messages.length > 23 ||
      messages.reduce((total, entry) => total + entry.content.length, 0) > 6000
    )
      return json(
        {
          error:
            "Conversation limit reached. Continue with the guided fields or Request Sales help in Customer Experience.",
        },
        400,
      );
    stage = "extract_requirements";
    const extractionAllowed = await reserveDailyAiRequest("discovery").catch(
      () => false,
    );
    const result = await extractAirFlameBrief({
      brief,
      current: session.requirements,
      aiAllowed: extractionAllowed,
    });
    const compatibility = evaluateJourney(result.requirements);
    const conversationContext = buildAdvisorConversationContext({
      messages,
      requirements: result.requirements,
    });
    const answerAllowed = await reserveDailyAiRequest("advisor").catch(
      () => false,
    );
    stage = "generate_answer";
    const reply = answerAllowed
      ? await generateAdvisorResponse({
          messages,
          compatibility,
          conversationContext,
          abortSignal: request.signal,
        })
      : createDeterministicAdvisorReply(compatibility, conversationContext);
    const answer = boundAdvisorAnswer(
      reply.answer,
      1_200,
      conversationContext.technicalTraceRequested,
    );
    stage = "save_conversation";
    await saveDiscovery(
      session.id,
      result.requirements,
      [...messages, { role: "assistant", content: answer }],
      session.discoveryMessages,
    );
    stage = "record_audit";
    await recordSessionEvent(session.id, "conversation_turn", {
      provider: reply.provider,
      model: reply.model,
      attempts: reply.attempts,
      extractionTokens: result.usage,
      estimatedCostUsd: null,
      costStatus: "Billing unavailable; global request caps apply",
      compatibility: compatibility.status,
      conversationIntent: conversationContext.intent,
      unsupportedConstraints: conversationContext.unsupportedConstraints,
    });
    return json({
      messages: [...messages, { role: "assistant", content: answer }],
      requirements: result.requirements,
      guidedReviewRequired: result.mode === "deterministic",
    });
  } catch {
    console.warn("ai.discovery.request_failed", { stage });
    return json(
      {
        error:
          "The conversation could not be saved. Retry or continue with guided discovery; no order was created.",
      },
      503,
    );
  }
}
