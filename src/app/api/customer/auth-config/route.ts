import { NextResponse } from "next/server";
import { appleClientId } from "@/lib/customer-auth";
import { isAppleConfigured } from "@/lib/apple-auth";

export const runtime = "nodejs";

export async function GET() {
  const configured = isAppleConfigured();
  return NextResponse.json({
    apple: {
      enabled: configured,
      // Client ID is required by Apple's JS SDK; it is a public OAuth client identifier.
      clientId: configured ? appleClientId() : null,
    },
  });
}
