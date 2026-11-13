import { headers } from "next/headers";
import { getIdentity, type VerifiedIdentity } from "../../cursor/identity";

export type OwnerAccess =
  | { ok: true; identity: VerifiedIdentity; simulated: boolean }
  | { ok: false; reason: string };

/**
 * Server-only owner gate. Trusts Cursor's signed identity header (or the
 * local simulated viewer while developing). Never check owner access in the browser.
 */
export async function getOwnerAccess(): Promise<OwnerAccess> {
  const identity = await getIdentity(await headers());
  if (!identity.verified) {
    return { ok: false, reason: identity.reason };
  }
  if (identity.kind !== "person") {
    return { ok: false, reason: "not_a_person" };
  }
  return { ok: true, identity, simulated: identity.simulated };
}
