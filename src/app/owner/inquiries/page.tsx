"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type InquiryView = {
  id: string;
  kind: string;
  listingTitle: string;
  message: string;
  status: "pending" | "contacted" | "closed";
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string | null;
};

const labels = {
  pending: "Pending",
  contacted: "Contacted",
  closed: "Closed",
} as const;

export default function OwnerInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryView[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/owner/inquiries", { credentials: "same-origin" });
        const data = (await res.json()) as { inquiries?: InquiryView[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Could not load");
        if (!cancelled) setInquiries(data.inquiries ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateStatus(id: string, status: InquiryView["status"]) {
    const res = await fetch("/api/owner/inquiries", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = (await res.json()) as { inquiry?: InquiryView; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Update failed");
      return;
    }
    if (data.inquiry) {
      setInquiries((prev) => prev.map((i) => (i.id === id ? data.inquiry! : i)));
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Inquiries</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Applications and tour requests from verified customers. Each inquiry also opens a message thread.
      </p>
      {error ? <p className="mt-4 text-sm text-clay-deep">{error}</p> : null}

      <div className="mt-8 space-y-4">
        {inquiries.map((i) => (
          <article key={i.id} className="rounded-xl bg-surface p-5 outline outline-1 outline-line">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-ink">{i.customerName ?? "Renter"}</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  <span className="font-medium text-forest capitalize">{i.kind}</span>
                  {" · "}
                  {i.listingTitle} · {new Date(i.createdAt).toLocaleString()} · {labels[i.status]}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["pending", "contacted", "closed"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateStatus(i.id, s)}
                    className={`rounded-full px-3 py-1 text-xs font-medium outline outline-1 ${
                      i.status === s
                        ? "bg-forest text-paper outline-forest"
                        : "bg-paper text-ink outline-line"
                    }`}
                  >
                    {labels[s]}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-ink/90">{i.message}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {i.customerEmail ? (
                <a href={`mailto:${i.customerEmail}`} className="font-medium text-forest hover:underline">
                  {i.customerEmail}
                </a>
              ) : null}
              {i.customerPhone ? (
                <a href={`tel:${i.customerPhone}`} className="font-medium text-forest hover:underline">
                  {i.customerPhone}
                </a>
              ) : null}
              <Link href="/owner/messages" className="font-medium text-forest hover:underline">
                Open messages
              </Link>
            </div>
          </article>
        ))}
        {inquiries.length === 0 ? (
          <div className="rounded-xl bg-surface p-8 outline outline-1 outline-line">
            <p className="text-ink-muted">No inquiries yet.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
