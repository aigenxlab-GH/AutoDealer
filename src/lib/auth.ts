// Lightweight signed-cookie session for the mock admin gate. Uses Web Crypto
// (HMAC-SHA256) so it runs in both Node and Edge runtimes. In Phase 7 this is
// replaced by Supabase Auth.

export const SESSION_COOKIE = "sah_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "insecure-dev-secret";
}

const encoder = new TextEncoder();

function bytesToB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function strToB64Url(str: string): string {
  return bytesToB64Url(encoder.encode(str));
}

function b64UrlToStr(b64: string): string {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bytesToB64Url(new Uint8Array(sig));
}

export interface SessionPayload {
  email: string;
  iat: number;
}

/** Create a signed session token for a logged-in admin. */
export async function createSessionToken(email: string): Promise<string> {
  const payload: SessionPayload = { email, iat: Date.now() };
  const data = strToB64Url(JSON.stringify(payload));
  const sig = await hmac(data);
  return `${data}.${sig}`;
}

/** Verify a token's signature + freshness; returns the payload or null. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = await hmac(data);
  if (expected !== sig) return null;

  try {
    const payload = JSON.parse(b64UrlToStr(data)) as SessionPayload;
    if (Date.now() - payload.iat > SESSION_TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Validate submitted credentials against the configured admin account. */
export function checkCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@sapphireautohub.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  return email.trim().toLowerCase() === adminEmail.toLowerCase() &&
    password === adminPassword;
}
