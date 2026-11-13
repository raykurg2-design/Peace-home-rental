import { NextResponse } from "next/server";
import {
  createSession,
  findCustomerByEmail,
  SESSION_COOKIE,
  toPublic,
  verifyPassword,
} from "@/lib/customer-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const row = await findCustomerByEmail(email);
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    const sessionId = await createSession(row.id);
    const res = NextResponse.json({ customer: toPublic(row) });
    res.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (error) {
    console.error("login failed", error);
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 });
  }
}
