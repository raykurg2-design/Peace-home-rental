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

/**
 * Verifies a Sign in with Apple identity token against Apple's JWKS.
 * When APPLE_CLIENT_ID is unset (local/sample), accepts a sample token payload only if sampleMode is true.
 */
export async function verifyAppleIdentityToken(
  identityToken: string,
  options?: { sampleMode?: boolean; sampleEmail?: string; sampleName?: string },
): Promise<AppleIdentity> {
  const clientId = appleClientId();

  if (!clientId) {
    if (!options?.sampleMode) {
      throw new Error("Apple Sign In is not configured.");
    }
    // Local/sample path — never used when APPLE_CLIENT_ID is set.
    const email = (options.sampleEmail || "apple.renter@example.com").toLowerCase();
    return {
      appleSub: `sample_apple_${Buffer.from(email).toString("hex").slice(0, 24)}`,
      email,
      emailVerified: true,
    };
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
