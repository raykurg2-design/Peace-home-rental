"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomerAuthPanel } from "@/components/CustomerAuthPanel";
import { fetchCustomer, type CustomerPublic } from "@/lib/customer-client";

export function AccountPanel({
  nextHref = "/account",
}: {
  nextHref?: string;
}) {
  const [customer, setCustomer] = useState<CustomerPublic | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchCustomer().then((c) => {
      if (!cancelled) setCustomer(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (customer === undefined) {
    return (
      <div className="rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <p className="text-sm text-ink-muted">Loading account…</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-4 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <h2 className="font-display text-3xl text-ink">Customer account</h2>
        <p className="text-sm text-ink-muted">
          Log in with email (password + 6-digit email security code) or Apple, or create a new customer
          account.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/login?next=${encodeURIComponent(nextHref)}`}
            className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            Log in
          </Link>
          <Link
            href={`/signup?next=${encodeURIComponent(nextHref)}`}
            className="rounded-md bg-paper px-5 py-3 text-sm font-semibold text-forest outline outline-1 outline-line"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return <CustomerAuthPanel mode="login" nextHref={nextHref} />;
}
