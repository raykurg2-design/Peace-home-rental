import { NextResponse } from "next/server";
import {
  consumeEmailToken,
  createSession,
  SESSION_COOKIE,
  toPublic,
} from "@/lib/customer-auth";

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
