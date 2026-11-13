"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { OFFICE, type Listing } from "@/lib/listings";
import { fetchCustomer, type CustomerPublic } from "@/lib/customer-client";
import type { InquiryKind } from "@/lib/rental-types";

function InquiryFormInner({
  listing,
  kind,
  title,
  intro,
  defaultMessage,
  submitLabel,
}: {
  listing?: Listing;
  kind: InquiryKind;
  title: string;
  intro: string;
  defaultMessage: string;
  submitLabel: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const [customer, setCustomer] = useState<CustomerPublic | null | undefined>(undefined);
  const [message, setMessage] = useState(defaultMessage);
  const [sent, setSent] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCustomer().then((c) => {
      if (!cancelled) setCustomer(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customer?.customerVerified) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/customer/inquiries", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingSlug: listing?.slug ?? "general",
          listingTitle: listing?.title ?? "General inquiry",
          kind,
          message: message.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string; threadId?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not submit.");
        return;
      }
      setThreadId(data.threadId ?? null);
      setSent(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (customer === undefined) {
    return (
      <div className="rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <p className="text-sm text-ink-muted">Checking verification…</p>
      </div>
    );
  }

  if (!customer?.customerVerified) {
    const accountHref = `/account?next=${encodeURIComponent(returnPath)}`;
    return (
      <div className="rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <h2 className="font-display text-3xl text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Verified renters only. Create an account, confirm your email, add a phone number, and accept
          rental policies before {kind === "tour" ? "requesting a tour" : "starting an application"}.
        </p>
        <Link
          href={accountHref}
          className="mt-5 inline-flex rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
        >
          Verify my account
        </Link>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <h2 className="font-display text-3xl text-forest">Request received</h2>
        <p className="mt-2 text-ink-muted">
          The office will follow up. A confirmation email is on the way when email delivery is configured.
          You can keep the conversation going in Messages.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {threadId ? (
            <Link
              href={`/messages?thread=${threadId}`}
              className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
            >
              Open messages
            </Link>
          ) : null}
          <a
            href={OFFICE.phoneHref}
            className="rounded-md bg-paper px-5 py-3 text-sm font-semibold text-forest outline outline-1 outline-line"
          >
            Call {OFFICE.phone}
          </a>
          <Link
            href="/properties"
            className="rounded-md bg-paper px-5 py-3 text-sm font-semibold text-forest outline outline-1 outline-line"
          >
            Keep browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
      <h2 className="font-display text-3xl text-ink">{title}</h2>
      <p className="text-sm text-ink-muted">{intro}</p>
      <div className="rounded-lg bg-paper px-3 py-3 text-sm outline outline-1 outline-line">
        <p className="font-medium text-ink">{customer.name}</p>
        <p className="text-ink-muted">
          {customer.email}
          {customer.phone ? ` · ${customer.phone}` : ""}
        </p>
        <p className="mt-1 text-xs font-semibold tracking-wide text-action uppercase">Verified customer</p>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-ink">Message</span>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
        />
      </label>
      {error ? <p className="text-sm text-clay-deep">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep disabled:opacity-60"
      >
        {submitLabel}
      </button>
    </form>
  );
}

export function InquiryForm(props: {
  listing?: Listing;
  kind: InquiryKind;
  title: string;
  intro: string;
  defaultMessage: string;
  submitLabel: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl bg-surface p-6 outline outline-1 outline-line">
          <p className="text-sm text-ink-muted">Loading form…</p>
        </div>
      }
    >
      <InquiryFormInner {...props} />
    </Suspense>
  );
}
