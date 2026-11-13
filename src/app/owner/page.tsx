"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ActivityFeed } from "@/components/ActivityFeed";
import { loadOwnerListings, statusLabel, type OwnerListing } from "@/lib/owner-store";
import { formatRent } from "@/lib/listings";

type InquiryView = {
  id: string;
  listingTitle: string;
  status: string;
  customerName?: string;
  createdAt: string;
};

export default function OwnerOverviewPage() {
  const [listings, setListings] = useState<OwnerListing[]>([]);
  const [inquiries, setInquiries] = useState<InquiryView[]>([]);
  const [threadCount, setThreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) setListings(loadOwnerListings());
    }, 0);
    (async () => {
      try {
        const [inqRes, msgRes] = await Promise.all([
          fetch("/api/owner/inquiries", { credentials: "same-origin" }),
          fetch("/api/owner/messages", { credentials: "same-origin" }),
        ]);
        const inqData = (await inqRes.json()) as { inquiries?: InquiryView[] };
        const msgData = (await msgRes.json()) as { threads?: unknown[] };
        if (cancelled) return;
        if (inqRes.ok) setInquiries(inqData.inquiries ?? []);
        if (msgRes.ok) setThreadCount(msgData.threads?.length ?? 0);
      } catch {
        /* overview still shows listings */
      }
    })();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const available = listings.filter((l) => l.status === "available").length;
  const openInquiries = inquiries.filter((i) => i.status === "pending").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">Owner overview</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Listings, renter inquiries, messages, and office activity in one place.
          </p>
        </div>
        <Link
          href="/owner/listings/new"
          className="rounded-md bg-forest px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-deep"
        >
          Add listing
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Listings" value={String(listings.length)} />
        <Stat label="Available" value={String(available)} />
        <Stat label="Open inquiries" value={String(openInquiries)} />
        <Stat label="Message threads" value={String(threadCount)} />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Your homes</h2>
          <Link href="/owner/listings" className="text-sm font-medium text-forest hover:underline">
            Manage all
          </Link>
        </div>
        <div className="divide-y divide-line overflow-hidden rounded-xl bg-surface outline outline-1 outline-line">
          {listings.slice(0, 8).map((p) => (
            <Link
              key={p.slug}
              href={`/owner/listings/${p.slug}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-paper"
            >
              <div>
                <p className="font-medium text-ink">{p.title}</p>
                <p className="text-sm text-ink-muted">
                  {p.city}, {p.state} · {statusLabel(p.status)} · {formatRent(p.rent)}
                </p>
              </div>
              <span className="text-sm text-forest">Edit</span>
            </Link>
          ))}
          {listings.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-muted">No listings yet.</p>
          ) : null}
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">Recent inquiries</h2>
            <Link href="/owner/inquiries" className="text-sm font-medium text-forest hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-line overflow-hidden rounded-xl bg-surface outline outline-1 outline-line">
            {inquiries.slice(0, 5).map((i) => (
              <div key={i.id} className="px-5 py-4">
                <p className="font-medium text-ink">{i.customerName ?? "Renter"}</p>
                <p className="text-sm text-ink-muted">
                  {i.listingTitle} · {i.status}
                </p>
              </div>
            ))}
            {inquiries.length === 0 ? (
              <p className="px-5 py-8 text-sm text-ink-muted">
                No inquiries yet. Verified renters submit tours and applications from the customer site.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl bg-surface p-5 outline outline-1 outline-line">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">Office activity</h2>
            <Link href="/owner/messages" className="text-sm font-medium text-forest hover:underline">
              Messages
            </Link>
          </div>
          <ActivityFeed endpoint="/api/owner/activity" emptyLabel="Activity will appear as renters engage." />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-5 outline outline-1 outline-line">
      <p className="text-xs tracking-[0.14em] text-ink-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl text-forest tabular-nums">{value}</p>
    </div>
  );
}
