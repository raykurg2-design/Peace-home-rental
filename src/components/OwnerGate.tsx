"use client";

import { OwnerShell } from "@/components/OwnerShell";

export function OwnerGate({ children }: { children: React.ReactNode }) {
  return <OwnerShell>{children}</OwnerShell>;
}
