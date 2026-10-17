// Uses the global Web Crypto API (not Node's `crypto` module) so this works
// identically whether proxy.ts runs on the Edge or Node.js runtime.

const COOKIE_SUBJECT = 'daylight_admin';

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

async function sign(payload: string, secret: string): Promise<string> {
  const key = await hmacKey(secret);
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
}

// Constant-time comparison — avoid leaking match length/position via timing.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Cookie value is `<expiry-epoch-seconds>.<hmac>`, so a leaked cookie stops
// working after SESSION_MAX_AGE_SECONDS even though the server keeps no state.
export async function createAdminSessionValue(): Promise<string | null> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;

  const expiry = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const signature = await sign(`${COOKIE_SUBJECT}:${expiry}`, secret);
  return `${expiry}.${signature}`;
}

export async function isValidAdminSession(cookieValue: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!cookieValue || !secret) return false;

  const [expiry, signature, ...rest] = cookieValue.split('.');
  if (!expiry || !signature || rest.length > 0) return false;
  if (!/^\d+$/.test(expiry) || Number(expiry) < Date.now() / 1000) return false;

  return safeEqual(await sign(`${COOKIE_SUBJECT}:${expiry}`, secret), signature);
}

// Compares HMACs of both values so the comparison is constant-time and
// independent of the password's length.
export async function isCorrectPassword(candidate: string): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  return safeEqual(await sign(candidate, secret), await sign(secret, secret));
}
