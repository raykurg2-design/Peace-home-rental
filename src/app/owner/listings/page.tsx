"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatRent } from "@/lib/listings";
import { loadOwnerListings, statusLabel, type OwnerListing } from "@/lib/owner-store";

export default function OwnerListingsPage() {
  const [listings, setListings] = useState<OwnerListing[]>([]);

  useEffect(() => {
    setListings(loadOwnerListings());
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">Listings</h1>
          <p className="mt-2 text-sm text-ink-muted">Manage homes shown on the customer site.</p>
        </div>
        <Link
          href="/owner/listings/new"
          className="rounded-md bg-forest px-4 py-2.5 text-sm font-semibold text-paper hover:bg-forest-deep"
        >
          Add listing
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl bg-surface outline outline-1 outline-line">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper/70 text-xs tracking-[0.12em] text-ink-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Home</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Market</th>
              <th className="px-4 py-3 font-medium">Rent</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {listings.map((l) => (
              <tr key={l.slug} className="hover:bg-paper/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{l.title}</p>
                  <p className="text-xs text-ink-muted sm:hidden">
                    {l.city}, {l.state}
                  </p>
                </td>
                <td className="hidden px-4 py-3 text-ink-muted sm:table-cell">
                  {l.city}, {l.state}
                </td>
                <td className="px-4 py-3 tabular-nums">{formatRent(l.rent)}</td>
                <td className="px-4 py-3">{statusLabel(l.status)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/owner/listings/${l.slug}`} className="font-medium text-forest hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {listings.length === 0 ? <p className="px-4 py-8 text-sm text-ink-muted">No listings yet.</p> : null}
      </div>
    </div>
  );
}
