import { createRemoteJWKSet, jwtVerify } from "jose";
import { appleClientId } from "@/lib/customer-auth";

const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

export type AppleIdentity = {
  appleSub: string;
  email: string | null;
  emailVerified: boolean;
};

export function isAppleConfigured(): boolean {
  return appleClientId() !== "";
}

/** Verifies a Sign in with Apple identity token against Apple's JWKS. Requires APPLE_CLIENT_ID. */
export async function verifyAppleIdentityToken(identityToken: string): Promise<AppleIdentity> {
  const clientId = appleClientId();
  if (!clientId) {
    throw new Error("Apple Sign In is not configured.");
  }
  if (!identityToken.trim()) {
    throw new Error("Apple identity token is required.");
  }

  const { payload } = await jwtVerify(identityToken, appleJwks, {
    issuer: "https://appleid.apple.com",
    audience: clientId,
    algorithms: ["RS256"],
  });

  if (typeof payload.sub !== "string" || !payload.sub) {
    throw new Error("Apple token missing subject.");
  }

  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : null;
  const emailVerified = payload.email_verified === true || payload.email_verified === "true";

  return {
    appleSub: payload.sub,
    email,
    emailVerified,
  };
}
