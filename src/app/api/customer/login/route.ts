import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import {
  createLoginChallenge,
  findCustomerByEmail,
  invalidateLoginChallenge,
  verifyPassword,
} from "@/lib/customer-auth";
import { sendSecurityCodeEmail } from "@/lib/email";
import { AUTH_LIMITS, authBucket, consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Step 1 of email login: validate credentials and email a 6-digit security code.
 * Session is created only after /api/customer/login/verify.
 * Security codes are never returned in the API response.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const rate = await consumeRateLimit(authBucket(request, "login", email), AUTH_LIMITS.login);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
      );
    }

    const row = await findCustomerByEmail(email);
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }
    if (!row.password_hash) {
      return NextResponse.json(
        { error: "This account uses Apple Sign In. Continue with Apple instead." },
        { status: 400 },
      );
    }

    const { challengeId, code } = await createLoginChallenge(row.id, "login");
    const mail = await sendSecurityCodeEmail({
      to: row.email,
      name: row.name,
      code,
      purpose: "login",
      idempotencyKey: `login-code/${challengeId}`,
    });

    if (!mail.sent) {
      await invalidateLoginChallenge(challengeId);
      return NextResponse.json(
        { error: "Email delivery is not configured. Security codes cannot be sent yet." },
        { status: 503 },
      );
    }

    await recordActivity({
      customerId: row.id,
      actorRole: "system",
      kind: "login_code_sent",
      title: "Login security code sent",
      detail: row.email,
    });

    return NextResponse.json({
      challengeId,
      email: row.email,
      codeSent: true,
    });
  } catch (error) {
    console.error("login start failed", error);
    return NextResponse.json({ error: "Could not start sign-in." }, { status: 500 });
  }
}
