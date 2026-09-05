const MAX_BODY_BYTES = 16_384;

export type RequestSecurityFailure = {
  status: 400 | 403 | 413 | 415;
  message: string;
};

export function validateAdvisorRequestHeaders(
  request: Request,
): RequestSecurityFailure | null {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return { status: 415, message: "Expected an application/json request." };
  }

  const declaredLength = Number.parseInt(
    request.headers.get("content-length") ?? "0",
    10,
  );
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return { status: 413, message: "Request body is too large." };
  }

  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return { status: 403, message: "Cross-origin request rejected." };
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return { status: 403, message: "Cross-origin request rejected." };
  }

  return null;
}

export async function readBoundedJsonBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return { ok: false as const, status: 400 as const };
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return { ok: false as const, status: 413 as const };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const body = new TextDecoder().decode(bytes);

  try {
    return { ok: true as const, value: JSON.parse(body) as unknown };
  } catch {
    return { ok: false as const, status: 400 as const };
  }
}
