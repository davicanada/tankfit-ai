import "server-only";
import { headers } from "next/headers";
import { UserFacingError } from "@/domain/journey/errors";

export async function assertActionOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const site = h.get("sec-fetch-site");
  if (!origin || !host || (site && site !== "same-origin"))
    throw new UserFacingError("Cross-origin request rejected.");
  try {
    if (new URL(origin).host !== host) throw new Error();
  } catch {
    throw new UserFacingError("Cross-origin request rejected.");
  }
}
