import type { Metadata } from "next";
import { OwnerShell } from "@/components/OwnerShell";
import { OwnerUnauthorized } from "@/components/OwnerUnauthorized";
import { getOwnerAccess } from "@/lib/owner-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Owner workspace",
    template: "%s · Owner · Peace Home Rental",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const access = await getOwnerAccess();

  if (!access.ok) {
    return <OwnerUnauthorized />;
  }

  return (
    <OwnerShell viewerName={access.identity.name} simulated={access.simulated}>
      {children}
    </OwnerShell>
  );
}
