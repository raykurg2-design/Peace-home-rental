import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import { getCurrentCustomer } from "@/lib/customer-auth";
import {
  createInquiry,
  listCustomerInquiries,
  toInquiryPublic,
  type InquiryKind,
} from "@/lib/inquiries";
import {
  sendInquiryConfirmationEmail,
  sendOwnerInquiryNoticeEmail,
} from "@/lib/email";
import { createThreadWithMessage } from "@/lib/messages";
import { originFrom } from "@/lib/request-origin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const rows = await listCustomerInquiries(customer.id);
    return NextResponse.json({ inquiries: rows.map(toInquiryPublic) });
  } catch (error) {
    console.error("list inquiries failed", error);
    return NextResponse.json({ error: "Could not load inquiries." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    if (!customer.email_verified_at || !customer.profile_verified_at || !customer.policies_accepted_at) {
      return NextResponse.json({ error: "Complete customer verification first." }, { status: 403 });
    }

    const body = (await request.json()) as {
      listingSlug?: string;
      listingTitle?: string;
      kind?: InquiryKind;
      message?: string;
    };
    const listingSlug = body.listingSlug?.trim() || "general";
    const listingTitle = body.listingTitle?.trim() || "General inquiry";
    const kind = body.kind === "tour" || body.kind === "apply" || body.kind === "general" ? body.kind : "general";
    const message = body.message?.trim() ?? "";
    if (message.length < 5) {
      return NextResponse.json({ error: "Please include a short message." }, { status: 400 });
    }

    const inquiry = await createInquiry({
      customerId: customer.id,
      listingSlug,
      listingTitle,
      kind,
      message,
    });

    const subject =
      kind === "tour"
        ? `Tour: ${listingTitle}`
        : kind === "apply"
          ? `Application: ${listingTitle}`
          : `Message: ${listingTitle}`;

    const { thread } = await createThreadWithMessage({
      customerId: customer.id,
      listingSlug,
      listingTitle,
      subject,
      inquiryId: inquiry.id,
      senderRole: "customer",
      senderName: customer.name,
      body: message,
    });

    const label = kind === "tour" ? "Tour request" : kind === "apply" ? "Application interest" : "Inquiry";
    await recordActivity({
      customerId: customer.id,
      actorRole: "customer",
      kind: `inquiry_${kind}`,
      title: `${label} submitted`,
      detail: listingTitle,
    });

    const origin = originFrom(request);
    await Promise.allSettled([
      sendInquiryConfirmationEmail({
        to: customer.email,
        name: customer.name,
        kind,
        listingTitle,
        message,
      }),
      sendOwnerInquiryNoticeEmail({
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        kind,
        listingTitle,
        message,
        ownerUrl: `${origin}/owner/inquiries`,
      }),
    ]);

    return NextResponse.json({
      inquiry: toInquiryPublic(inquiry),
      threadId: thread.id,
    });
  } catch (error) {
    console.error("create inquiry failed", error);
    return NextResponse.json({ error: "Could not submit inquiry." }, { status: 500 });
  }
}
