import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import {
  createLoginChallenge,
  findCustomerByEmail,
  verifyPassword,
} from "@/lib/customer-auth";
import { sendSecurityCodeEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * Step 1 of email login: validate credentials and email a 6-digit security code.
 * Session is created only after /api/customer/login/verify.
 */
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
    });

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
      codeSent: mail.sent,
      // Local/sample only — never returned when Resend is configured.
      previewCode: mail.sent ? null : code,
    });
  } catch (error) {
    console.error("login start failed", error);
    return NextResponse.json({ error: "Could not start sign-in." }, { status: 500 });
  }
}
