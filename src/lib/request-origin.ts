/**
 * Absolute origin for links in email. Prefer a pinned APP_ORIGIN so Host /
 * X-Forwarded-* headers cannot redirect verification links to an attacker.
 */
export function originFrom(request: Request): string {
  const pinned = process.env.APP_ORIGIN?.trim().replace(/\/$/, "");
  if (pinned) return pinned;

  try {
    return new URL(request.url).origin;
  } catch {
    return "http://127.0.0.1:3000";
  }
}
