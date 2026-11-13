import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import {
  createCustomer,
  createEmailToken,
  createSession,
  SESSION_COOKIE,
  toPublic,
} from "@/lib/customer-auth";
import { sendVerificationEmail } from "@/lib/email";
import { originFrom } from "@/lib/request-origin";

export const runtime = "nodejs";

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

    const token = await createEmailToken(customer.id, "email_verify");
    const verifyUrl = `${originFrom(request)}/account/verify?token=${token}`;
    const mail = await sendVerificationEmail({ to: customer.email, name: customer.name, verifyUrl });

    const sessionId = await createSession(customer.id);
    const res = NextResponse.json({
      customer: toPublic(customer),
      email: {
        sent: mail.sent,
        previewUrl: mail.previewUrl ?? null,
      },
    });
    res.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (error) {
    console.error("signup failed", error);
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
