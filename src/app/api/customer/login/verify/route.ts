import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import {
  consumeLoginChallenge,
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
  toPublic,
} from "@/lib/customer-auth";
import { AUTH_LIMITS, authBucket, consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { challengeId?: string; code?: string };
    const challengeId = body.challengeId?.trim() ?? "";
    const code = (body.code ?? "").replace(/\D/g, "");
    if (!challengeId || code.length !== 6) {
      return NextResponse.json(
        { error: "Enter the 6-digit security code from your email." },
        { status: 400 },
      );
    }

    const rate = await consumeRateLimit(
      authBucket(request, "login-verify", challengeId),
      AUTH_LIMITS.verify,
    );
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many code attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
      );
    }

    const customer = await consumeLoginChallenge(challengeId, code, "login");
    if (!customer) {
      return NextResponse.json({ error: "Invalid or expired security code." }, { status: 401 });
    }

    await recordActivity({
      customerId: customer.id,
      actorRole: "customer",
      kind: "login_success",
      title: "Signed in with email security code",
      detail: customer.email,
    });

    const sessionId = await createSession(customer.id);
    const res = NextResponse.json({ customer: toPublic(customer) });
    res.cookies.set(SESSION_COOKIE, sessionId, sessionCookieOptions());
    return res;
  } catch (error) {
    console.error("login verify failed", error);
    return NextResponse.json({ error: "Could not complete sign-in." }, { status: 500 });
  }
}
