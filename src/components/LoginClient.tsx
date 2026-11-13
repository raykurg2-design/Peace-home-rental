"use client";

import { useSearchParams } from "next/navigation";
import { CustomerAuthPanel } from "@/components/CustomerAuthPanel";

export function LoginClient({ mode }: { mode: "login" | "signup" }) {
  const params = useSearchParams();
  const next = params.get("next");
  const nextHref =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return <CustomerAuthPanel mode={mode} nextHref={nextHref} />;
}
