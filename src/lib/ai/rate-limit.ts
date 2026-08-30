import "server-only";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 6;
const buckets = new Map<string, { count: number; resetAt: number }>();

function normalizeClientKey(request: Request) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return forwarded?.slice(0, 80) || "unknown-client";
}

export function consumeAdvisorRateLimit(request: Request, now = Date.now()) {
  const key = normalizeClientKey(request);
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1_000),
      ),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetAdvisorRateLimitForTests() {
  buckets.clear();
}
