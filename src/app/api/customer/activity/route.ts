import { NextResponse } from "next/server";
import { listCustomerActivity, toActivityPublic } from "@/lib/activity";
import { getCurrentCustomer } from "@/lib/customer-auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const rows = await listCustomerActivity(customer.id);
    return NextResponse.json({ activities: rows.map(toActivityPublic) });
  } catch (error) {
    console.error("list activity failed", error);
    return NextResponse.json({ error: "Could not load activity." }, { status: 500 });
  }
}
