import { evaluateCompatibility } from "@/domain/compatibility/evaluate";
import { generateAdvisorResponse } from "@/lib/ai/provider-router";
import { consumeAdvisorRateLimit } from "@/lib/ai/rate-limit";
import {
  readBoundedJsonBody,
  validateAdvisorRequestHeaders,
} from "@/lib/ai/request-security";
import { advisorRequestSchema } from "@/lib/ai/types";
import { catalog } from "@/lib/catalog";

export const runtime = "nodejs";
export const maxDuration = 35;

function noStoreJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return Response.json(body, { ...init, headers });
}

export async function POST(request: Request) {
  const securityFailure = validateAdvisorRequestHeaders(request);
  if (securityFailure) {
    return noStoreJson(
      { error: securityFailure.message },
      { status: securityFailure.status },
    );
  }

  const rateLimit = consumeAdvisorRateLimit(request);
  if (!rateLimit.allowed) {
    return noStoreJson(
      { error: "Too many advisor requests. Please wait and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const body = await readBoundedJsonBody(request);
  if (!body.ok) {
    return noStoreJson(
      {
        error:
          body.status === 413
            ? "Request body is too large."
            : "Request body is not valid JSON.",
      },
      { status: body.status },
    );
  }

  const parsed = advisorRequestSchema.safeParse(body.value);
  if (!parsed.success) {
    return noStoreJson(
      { error: "The advisor request did not match the accepted format." },
      { status: 400 },
    );
  }

  const compatibility = evaluateCompatibility(
    catalog.products,
    parsed.data.requirements,
  );
  const reply = await generateAdvisorResponse({
    messages: parsed.data.messages,
    compatibility,
    abortSignal: request.signal,
  });

  return noStoreJson(reply);
}
