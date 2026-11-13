import type { Metadata } from "next";
import { OwnerGate } from "@/components/OwnerGate";

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

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <OwnerGate>{children}</OwnerGate>;
}
