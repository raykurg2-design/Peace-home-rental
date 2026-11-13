"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import type { CustomerPublic } from "@/lib/customer-client";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "Confirming your email…" : "Missing verification token.");
  const [customer, setCustomer] = useState<CustomerPublic | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/customer/verify-email", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json()) as { error?: string; customer?: CustomerPublic };
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error ?? "Verification failed.");
          return;
        }
        setCustomer(data.customer ?? null);
        setStatus("ok");
        setMessage("Email verified.");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Network error while verifying.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="rounded-2xl bg-surface p-6 outline outline-1 outline-line">
      <h2 className="font-display text-3xl text-ink">
        {status === "ok" ? "Email confirmed" : status === "error" ? "Could not verify" : "Verifying"}
      </h2>
      <p className="mt-2 text-sm text-ink-muted">{message}</p>
      {status === "ok" ? (
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/account"
            className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            {customer?.customerVerified ? "Go to account" : "Finish customer verification"}
          </Link>
        </div>
      ) : status === "error" ? (
        <div className="mt-5">
          <Link href="/account" className="text-sm font-semibold text-forest hover:underline">
            Back to account
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Shell>
      <section className="mx-auto max-w-xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Email</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Verify email</h1>
        <div className="mt-8">
          <Suspense
            fallback={
              <div className="rounded-2xl bg-surface p-6 outline outline-1 outline-line">
                <p className="text-sm text-ink-muted">Loading…</p>
              </div>
            }
          >
            <VerifyInner />
          </Suspense>
        </div>
      </section>
    </Shell>
  );
}
