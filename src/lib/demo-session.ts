import "server-only";
import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";

const SESSION_TTL_SECONDS = 24 * 60 * 60;
const STAFF_TTL_SECONDS = 10 * 60;

function sessionCookieName() {
  return process.env.NODE_ENV === "production"
    ? "__Host-tankfit_session"
    : "tankfit_session";
}

function staffCookieName() {
  return process.env.NODE_ENV === "production"
    ? "__Host-tankfit_staff"
    : "tankfit_staff";
}

function getSecret() {
  const secret = process.env.SESSION_SIGNING_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SIGNING_SECRET must contain at least 32 characters.");
  }
  return secret;
}

function signature(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function sign(value: string) {
  return `${value}.${signature(value)}`;
}

function verify(value: string | undefined) {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;
  const payload = value.slice(0, separator);
  const suppliedSignature = value.slice(separator + 1);
  return safeEqual(signature(payload), suppliedSignature) ? payload : null;
}

export async function readSessionId() {
  const store = await cookies();
  return verify(store.get(sessionCookieName())?.value);
}

export async function writeSessionId(sessionId: string) {
  const store = await cookies();
  store.set(sessionCookieName(), sign(sessionId), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

type StaffClaims = {
  sessionId: string;
  orderId: string;
  expiresAt: number;
  nonce: string;
};

export async function writeStaffToken(sessionId: string, orderId: string) {
  const claims: StaffClaims = {
    sessionId,
    orderId,
    expiresAt: Date.now() + STAFF_TTL_SECONDS * 1_000,
    nonce: randomUUID(),
  };
  const payload = Buffer.from(JSON.stringify(claims), "utf8").toString(
    "base64url",
  );
  const store = await cookies();
  store.set(staffCookieName(), sign(payload), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STAFF_TTL_SECONDS,
  });
}

export async function readStaffClaims(): Promise<StaffClaims | null> {
  const store = await cookies();
  const payload = verify(store.get(staffCookieName())?.value);
  if (!payload) return null;

  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as StaffClaims;
    if (
      typeof claims.sessionId !== "string" ||
      typeof claims.orderId !== "string" ||
      typeof claims.expiresAt !== "number" ||
      claims.expiresAt <= Date.now()
    ) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}

export async function clearStaffToken() {
  const store = await cookies();
  store.set(staffCookieName(), "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export const demoSessionLifetimeMs = SESSION_TTL_SECONDS * 1_000;
