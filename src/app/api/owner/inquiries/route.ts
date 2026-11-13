import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity";
import {
  listAllInquiries,
  toInquiryPublic,
  updateInquiryStatus,
  type InquiryStatus,
} from "@/lib/inquiries";
import { getOwnerAccess } from "@/lib/owner-auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const access = await getOwnerAccess();
    if (!access.ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const rows = await listAllInquiries();
    return NextResponse.json({ inquiries: rows.map(toInquiryPublic) });
  } catch (error) {
    console.error("owner list inquiries failed", error);
    return NextResponse.json({ error: "Could not load inquiries." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const access = await getOwnerAccess();
    if (!access.ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const body = (await request.json()) as { id?: string; status?: InquiryStatus };
    const id = body.id?.trim() ?? "";
    const status = body.status;
    if (!id || !status || !["pending", "contacted", "closed"].includes(status)) {
      return NextResponse.json({ error: "id and valid status are required." }, { status: 400 });
    }
    const updated = await updateInquiryStatus(id, status);
    if (!updated) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
    await recordActivity({
      customerId: updated.customer_id,
      actorRole: "owner",
      kind: "inquiry_status",
      title: `Inquiry marked ${status}`,
      detail: updated.listing_title,
    });
    return NextResponse.json({ inquiry: toInquiryPublic(updated) });
  } catch (error) {
    console.error("owner update inquiry failed", error);
    return NextResponse.json({ error: "Could not update inquiry." }, { status: 500 });
  }
}
