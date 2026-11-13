/** Canonical public site — used for email verification / welcome links. */
export const DEFAULT_APP_ORIGIN = "https://peacehomerental.com";

/**
 * Absolute origin for links in email. Prefer APP_ORIGIN when set, otherwise
 * the brand domain so Host / X-Forwarded-* headers cannot spoof link targets.
 * Local/dev still falls back to the request URL when it is loopback.
 */
export function originFrom(request: Request): string {
  const pinned = process.env.APP_ORIGIN?.trim().replace(/\/$/, "");
  if (pinned) return pinned;

  try {
    const fromRequest = new URL(request.url).origin;
    if (
      fromRequest.startsWith("http://127.") ||
      fromRequest.startsWith("http://localhost") ||
      fromRequest.startsWith("http://[::1]")
    ) {
      return fromRequest;
    }
  } catch {
    /* ignore */
  }

  return DEFAULT_APP_ORIGIN;
}
