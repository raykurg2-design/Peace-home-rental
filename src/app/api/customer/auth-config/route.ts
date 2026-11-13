import { NextResponse } from "next/server";
import { appleClientId } from "@/lib/customer-auth";
import { isAppleConfigured } from "@/lib/apple-auth";

export const runtime = "nodejs";

export async function GET() {
  const clientId = appleClientId();
  return NextResponse.json({
    apple: {
      enabled: isAppleConfigured(),
      clientId: clientId || null,
      sampleMode: !isAppleConfigured(),
    },
  });
}
