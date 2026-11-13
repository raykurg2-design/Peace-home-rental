import { NextResponse } from "next/server";
import {
  createEmailToken,
  getCurrentCustomer,
  toPublic,
} from "@/lib/customer-auth";
import { sendVerificationEmail } from "@/lib/email";
import { originFrom } from "@/lib/request-origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Sign in to resend verification." }, { status: 401 });
    }
    if (customer.email_verified_at) {
      return NextResponse.json({ customer: toPublic(customer), email: { sent: false, alreadyVerified: true } });
    }

    const token = await createEmailToken(customer.id, "email_verify");
    const verifyUrl = `${originFrom(request)}/account/verify?token=${token}`;
    const mail = await sendVerificationEmail({
      to: customer.email,
      name: customer.name,
      verifyUrl,
    });

    if (!mail.sent) {
      return NextResponse.json(
        { error: "Email delivery is not configured. Verification links cannot be sent yet." },
        { status: 503 },
      );
    }

    return NextResponse.json({
      customer: toPublic(customer),
      email: { sent: true },
    });
  } catch (error) {
    console.error("resend-verification failed", error);
    return NextResponse.json({ error: "Could not resend verification." }, { status: 500 });
  }
}
