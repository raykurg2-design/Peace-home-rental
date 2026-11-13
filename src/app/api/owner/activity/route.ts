import { NextResponse } from "next/server";
import { listOwnerActivity, toActivityPublic } from "@/lib/activity";
import { getOwnerAccess } from "@/lib/owner-auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const access = await getOwnerAccess();
    if (!access.ok) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const rows = await listOwnerActivity();
    return NextResponse.json({ activities: rows.map(toActivityPublic) });
  } catch (error) {
    console.error("owner activity failed", error);
    return NextResponse.json({ error: "Could not load activity." }, { status: 500 });
  }
}
