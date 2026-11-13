import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import {
  createCustomer,
  createLoginChallenge,
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
  toPublic,
} from "@/lib/customer-auth";
import { sendSecurityCodeEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * Create account, then require a 6-digit email security code before the email is verified.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const name = body.name?.trim() ?? "";

    if (!email || !email.includes("@") || name.length < 2 || password.length < 8) {
      return NextResponse.json(
        { error: "Name, a valid email, and a password of at least 8 characters are required." },
        { status: 400 },
      );
    }

    let customer;
    try {
      customer = await createCustomer({ email, password, name });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("unique") || msg.includes("duplicate")) {
        return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
      }
      throw error;
    }

    await recordActivity({
      customerId: customer.id,
      actorRole: "customer",
      kind: "account_created",
      title: "Account created",
      detail: customer.email,
    });

    const { challengeId, code } = await createLoginChallenge(customer.id, "signup");
    const mail = await sendSecurityCodeEmail({
      to: customer.email,
      name: customer.name,
      code,
      purpose: "signup",
    });

    const sessionId = await createSession(customer.id);
    const res = NextResponse.json({
      customer: toPublic(customer),
      challengeId,
      email: {
        sent: mail.sent,
        previewCode: mail.sent ? null : code,
      },
    });
    res.cookies.set(SESSION_COOKIE, sessionId, sessionCookieOptions());
    return res;
  } catch (error) {
    console.error("signup failed", error);
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
