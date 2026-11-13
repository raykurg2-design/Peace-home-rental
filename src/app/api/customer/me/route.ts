import { NextResponse } from "next/server";
import { getCurrentCustomer, toPublic } from "@/lib/customer-auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) return NextResponse.json({ customer: null });
    return NextResponse.json({ customer: toPublic(customer) });
  } catch (error) {
    console.error("me failed", error);
    return NextResponse.json({ error: "Could not load account." }, { status: 500 });
  }
}
