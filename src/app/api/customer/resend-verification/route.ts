import { NextResponse } from "next/server";
import {
  createEmailToken,
  getCurrentCustomer,
  toPublic,
} from "@/lib/customer-auth";
import { sendVerificationEmail } from "@/lib/email";

export const runtime = "nodejs";

function originFrom(request: Request): string {
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "127.0.0.1:3000";
  return `${proto}://${host}`;
}

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

    return NextResponse.json({
      customer: toPublic(customer),
      email: { sent: mail.sent, previewUrl: mail.previewUrl ?? null },
    });
  } catch (error) {
    console.error("resend-verification failed", error);
    return NextResponse.json({ error: "Could not resend verification." }, { status: 500 });
  }
}
