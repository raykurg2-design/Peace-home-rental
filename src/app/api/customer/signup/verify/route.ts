import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import {
  consumeLoginChallenge,
  createSession,
  getCurrentCustomer,
  SESSION_COOKIE,
  sessionCookieOptions,
  toPublic,
} from "@/lib/customer-auth";
import { sendWelcomeEmail } from "@/lib/email";
import { originFrom } from "@/lib/request-origin";

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

    const customer = await consumeLoginChallenge(challengeId, code, "signup");
    if (!customer) {
      return NextResponse.json({ error: "Invalid or expired security code." }, { status: 401 });
    }

    await recordActivity({
      customerId: customer.id,
      actorRole: "system",
      kind: "email_verified",
      title: "Email verified with security code",
      detail: customer.email,
    });

    const origin = originFrom(request);
    await Promise.allSettled([
      sendWelcomeEmail({
        to: customer.email,
        name: customer.name,
        accountUrl: `${origin}/account`,
        idempotencyKey: `welcome-email/${customer.id}`,
      }),
      recordActivity({
        customerId: customer.id,
        actorRole: "system",
        kind: "welcome_email",
        title: "Welcome email sent",
        detail: "Welcome to Peace Home Rental",
      }),
    ]);

    const current = await getCurrentCustomer();
    const sessionId = current?.id === customer.id ? null : await createSession(customer.id);
    const res = NextResponse.json({ customer: toPublic(customer) });
    if (sessionId) {
      res.cookies.set(SESSION_COOKIE, sessionId, sessionCookieOptions());
    }
    return res;
  } catch (error) {
    console.error("signup verify failed", error);
    return NextResponse.json({ error: "Could not verify security code." }, { status: 500 });
  }
}
