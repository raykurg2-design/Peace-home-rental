"use client";

import { useEffect, useState } from "react";
import {
  loadInquiries,
  setInquiryStatus,
  statusLabel,
  type Inquiry,
  type InquiryStatus,
} from "@/lib/owner-store";

export default function OwnerInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    setInquiries(loadInquiries());
  }, []);

  function updateStatus(id: string, status: InquiryStatus) {
    setInquiries(setInquiryStatus(id, status));
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Inquiries</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Applications and tour requests from the customer site land here — not on the public pages.
      </p>

      <div className="mt-8 space-y-4">
        {inquiries.map((i) => (
          <article key={i.id} className="rounded-xl bg-surface p-5 outline outline-1 outline-line">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-ink">{i.name}</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  <span className="font-medium text-forest capitalize">{i.kind ?? "apply"}</span>
                  {" · "}
                  {i.listingTitle} · {new Date(i.createdAt).toLocaleString()} · {statusLabel(i.status)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["pending", "contacted", "closed"] as InquiryStatus[]).map((s) => (
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
                    {statusLabel(s)}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-ink/90">{i.message}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <a href={`mailto:${i.email}`} className="font-medium text-forest hover:underline">
                {i.email}
              </a>
              {i.phone ? (
                <a href={`tel:${i.phone}`} className="font-medium text-forest hover:underline">
                  {i.phone}
                </a>
              ) : null}
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
