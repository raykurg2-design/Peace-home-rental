import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import {
  consumeEmailToken,
  createSession,
  SESSION_COOKIE,
  toPublic,
} from "@/lib/customer-auth";
import { sendWelcomeEmail } from "@/lib/email";
import { originFrom } from "@/lib/request-origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const token = body.token?.trim() ?? "";
    if (!token) {
      return NextResponse.json({ error: "Verification token is required." }, { status: 400 });
    }

    const customer = await consumeEmailToken(token, "email_verify");
    if (!customer) {
      return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 400 });
    }

    await recordActivity({
      customerId: customer.id,
      actorRole: "system",
      kind: "email_verified",
      title: "Email verified",
      detail: customer.email,
    });

    const origin = originFrom(request);
    await Promise.allSettled([
      sendWelcomeEmail({
        to: customer.email,
        name: customer.name,
        accountUrl: `${origin}/account`,
      }),
      recordActivity({
        customerId: customer.id,
        actorRole: "system",
        kind: "welcome_email",
        title: "Welcome email sent",
        detail: "Welcome to Peace Home Rental",
      }),
    ]);

    const sessionId = await createSession(customer.id);
    const res = NextResponse.json({ customer: toPublic(customer) });
    res.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (error) {
    console.error("verify-email failed", error);
    return NextResponse.json({ error: "Could not verify email." }, { status: 500 });
  }
}
