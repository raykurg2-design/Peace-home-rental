import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import {
  completeCustomerVerification,
  getCurrentCustomer,
  toPublic,
} from "@/lib/customer-auth";
import { sendVerifiedCustomerEmail } from "@/lib/email";
import { originFrom } from "@/lib/request-origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ error: "Sign in first." }, { status: 401 });
    }
    if (!customer.email_verified_at) {
      return NextResponse.json(
        { error: "Verify your email before completing customer verification." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as { phone?: string; acceptPolicies?: boolean };
    const phone = body.phone?.trim() ?? "";
    if (!body.acceptPolicies) {
      return NextResponse.json({ error: "Accept rental policies to continue." }, { status: 400 });
    }
    if (phone.length < 7) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }

    const updated = await completeCustomerVerification({ customerId: customer.id, phone });
    if (!updated) {
      return NextResponse.json({ error: "Could not update profile." }, { status: 400 });
    }

    await recordActivity({
      customerId: updated.id,
      actorRole: "customer",
      kind: "customer_verified",
      title: "Customer verification complete",
      detail: phone,
    });

    const origin = originFrom(request);
    await Promise.allSettled([
      sendVerifiedCustomerEmail({
        to: updated.email,
        name: updated.name,
        homesUrl: `${origin}/properties`,
        idempotencyKey: `verified-customer/${updated.id}`,
      }),
    ]);

    return NextResponse.json({ customer: toPublic(updated) });
  } catch (error) {
    console.error("verify-profile failed", error);
    return NextResponse.json({ error: "Could not complete verification." }, { status: 500 });
  }
}
