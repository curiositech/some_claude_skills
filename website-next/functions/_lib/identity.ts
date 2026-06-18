/**
 * Anonymous user identification.
 *
 * MAC addresses are NOT available to web servers — browsers never expose them.
 * We use a hybrid the user can't trivially evade but that stays privacy-light:
 *   1. PRIMARY: a first-party anonymous UUID stored in an httpOnly cookie.
 *   2. BACKUP:  sha256(ip + user-agent + salt) — survives cookie clearing,
 *      catches the obvious "incognito to get more free uses" case.
 *
 * The IP itself is never stored in plaintext; only its salted hash is kept.
 */

import type { Env } from "./env";

const COOKIE_NAME = "scs_mspaint_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export interface Identity {
  cookieUuid: string;
  ipUaHash: string;
  isNewCookie: boolean;
  country: string | null;
  userAgent: string;
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function uuid(): string {
  return crypto.randomUUID();
}

export async function identify(request: Request, env: Env): Promise<Identity> {
  const cookies = parseCookies(request.headers.get("Cookie"));
  let cookieUuid = cookies[COOKIE_NAME];
  let isNewCookie = false;
  if (!cookieUuid || cookieUuid.length < 8) {
    cookieUuid = uuid();
    isNewCookie = true;
  }

  // Cloudflare-provided client signals.
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    "0.0.0.0";
  const ua = request.headers.get("User-Agent") || "unknown";
  // @ts-expect-error cf is added by the Cloudflare runtime
  const country: string | null = request.cf?.country ?? null;

  const salt = env.IDENTITY_SALT || "scs-mspaint-default-salt";
  const ipUaHash = await sha256Hex(`${ip}::${ua}::${salt}`);

  return { cookieUuid, ipUaHash, isNewCookie, country, userAgent: ua };
}

/** Set-Cookie header value that persists the anonymous id. */
export function identityCookie(cookieUuid: string): string {
  return [
    `${COOKIE_NAME}=${encodeURIComponent(cookieUuid)}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}
