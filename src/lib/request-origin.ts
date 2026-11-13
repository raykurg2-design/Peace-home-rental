export function originFrom(request: Request): string {
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "127.0.0.1:3000";
  return `${proto}://${host}`;
}
