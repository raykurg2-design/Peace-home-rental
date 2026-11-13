import { createHash } from "node:crypto";
import { sql } from "@/lib/db";

type LimitConfig = {
  /** Max allowed hits inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

const DEFAULTS: LimitConfig = { limit: 10, windowMs: 15 * 60 * 1000 };

function hashPart(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

/** Client IP from proxy headers (hashed later — never stored plain). */
function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  return (
    forwarded ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("true-client-ip")?.trim() ||
    ""
  );
}

/** Cursor signed-in viewer header when present (private/team apps). */
function cursorIdentity(headers: Headers): string {
  return (
    headers.get("x-cursor-identity-v2")?.trim() ||
    headers.get("x-cursor-identity")?.trim() ||
    ""
  );
}

/**
 * Fixed-window rate limit keyed by a bucket string.
 * Returns whether the request is allowed.
 */
export async function consumeRateLimit(
  bucket: string,
  config: LimitConfig = DEFAULTS,
): Promise<{ allowed: boolean; retryAfterSec: number }> {
  const key = bucket.slice(0, 240);
  const now = Date.now();

  const rows = await sql<{ hit_count: number; window_started_at: string }>(
    `select hit_count, window_started_at from auth_rate_limits where bucket = $1`,
    [key],
  );

  const row = rows[0];
  if (!row) {
    await sql(
      `insert into auth_rate_limits (bucket, hit_count, window_started_at) values ($1, 1, now())
       on conflict (bucket) do update set hit_count = auth_rate_limits.hit_count + 1`,
      [key],
    );
    return { allowed: true, retryAfterSec: 0 };
  }

  const started = new Date(row.window_started_at).getTime();
  if (Number.isNaN(started) || now - started >= config.windowMs) {
    await sql(
      `update auth_rate_limits set hit_count = 1, window_started_at = now() where bucket = $1`,
      [key],
    );
    return { allowed: true, retryAfterSec: 0 };
  }

  if (row.hit_count >= config.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((config.windowMs - (now - started)) / 1000));
    return { allowed: false, retryAfterSec };
  }

  await sql(`update auth_rate_limits set hit_count = hit_count + 1 where bucket = $1`, [key]);
  return { allowed: true, retryAfterSec: 0 };
}

/**
 * Auth bucket: IP + Cursor identity + User-Agent + route (+ optional email).
 * Rotating only the User-Agent no longer resets the limit.
 */
export function authBucket(request: Request, route: string, email?: string): string {
  const headers = request.headers;
  const ip = hashPart(clientIp(headers) || "unknown-ip");
  const identity = hashPart(cursorIdentity(headers) || "anon");
  const ua = hashPart(headers.get("user-agent") ?? "");
  const mail = (email ?? "").trim().toLowerCase();
  return `${route}:${ip}:${identity}:${ua}:${mail}`;
}

/** Per signed-in customer action bucket (messages, inquiries). */
export function customerActionBucket(customerId: string, action: string): string {
  return `customer:${action}:${customerId}`;
}

export const AUTH_LIMITS = {
  login: { limit: 8, windowMs: 15 * 60 * 1000 },
  signup: { limit: 5, windowMs: 60 * 60 * 1000 },
  verify: { limit: 20, windowMs: 15 * 60 * 1000 },
  resend: { limit: 5, windowMs: 60 * 60 * 1000 },
  apple: { limit: 10, windowMs: 15 * 60 * 1000 },
  messages: { limit: 20, windowMs: 60 * 60 * 1000 },
  inquiries: { limit: 10, windowMs: 60 * 60 * 1000 },
} as const;
