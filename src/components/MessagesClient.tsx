"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageInbox } from "@/components/MessageInbox";
import { fetchCustomer, type CustomerPublic } from "@/lib/customer-client";

export function MessagesClient({ mode }: { mode: "customer" | "owner" }) {
  const params = useSearchParams();
  const threadId = params.get("thread");
  const [customer, setCustomer] = useState<CustomerPublic | null | undefined>(
    mode === "owner" ? null : undefined,
  );

  useEffect(() => {
    if (mode !== "customer") return;
    let cancelled = false;
    fetchCustomer().then((c) => {
      if (!cancelled) setCustomer(c);
    });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  if (mode === "customer") {
    if (customer === undefined) {
      return <p className="text-sm text-ink-muted">Checking account…</p>;
    }
    if (!customer) {
      return (
        <div className="rounded-2xl bg-surface p-6 outline outline-1 outline-line">
          <p className="text-sm text-ink-muted">Sign in to message the office.</p>
          <Link
            href="/account?next=/messages"
            className="mt-4 inline-flex rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            Go to account
          </Link>
        </div>
      );
    }
    if (!customer.emailVerified) {
      return (
        <div className="rounded-2xl bg-surface p-6 outline outline-1 outline-line">
          <p className="text-sm text-ink-muted">Verify your email before messaging.</p>
          <Link
            href="/account"
            className="mt-4 inline-flex rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            Finish verification
          </Link>
        </div>
      );
    }
  }

  return <MessageInbox mode={mode} initialThreadId={threadId} />;
}
