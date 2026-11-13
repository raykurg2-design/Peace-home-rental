import { sql } from "@/lib/db";
import { requestFingerprint } from "@/lib/customer-auth";

type LimitConfig = {
  /** Max allowed hits inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

const DEFAULTS: LimitConfig = { limit: 10, windowMs: 15 * 60 * 1000 };

/**
 * Sliding fixed-window rate limit keyed by a bucket string (route + fingerprint + email).
 * Returns true when the request is allowed.
 */
export async function consumeRateLimit(
  bucket: string,
  config: LimitConfig = DEFAULTS,
): Promise<{ allowed: boolean; retryAfterSec: number }> {
  const key = bucket.slice(0, 200);
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

export function authBucket(request: Request, route: string, email?: string): string {
  const fp = requestFingerprint(request.headers);
  const mail = (email ?? "").trim().toLowerCase();
  return `${route}:${fp}:${mail}`;
}

export const AUTH_LIMITS = {
  login: { limit: 8, windowMs: 15 * 60 * 1000 },
  signup: { limit: 5, windowMs: 60 * 60 * 1000 },
  verify: { limit: 20, windowMs: 15 * 60 * 1000 },
  resend: { limit: 5, windowMs: 60 * 60 * 1000 },
  apple: { limit: 10, windowMs: 15 * 60 * 1000 },
} as const;
