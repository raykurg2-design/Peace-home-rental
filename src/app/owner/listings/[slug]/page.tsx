"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { formatRent } from "@/lib/listings";
import {
  loadOwnerListings,
  setListingStatus,
  statusLabel,
  upsertOwnerListing,
  type ListingStatus,
  type OwnerListing,
} from "@/lib/owner-store";

export default function EditListingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [listing, setListing] = useState<OwnerListing | null>(null);
  const [title, setTitle] = useState("");
  const [rent, setRent] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ListingStatus>("available");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const found = loadOwnerListings().find((l) => l.slug === slug) ?? null;
    setListing(found);
    if (found) {
      setTitle(found.title);
      setRent(String(found.rent));
      setDescription(found.description);
      setStatus(found.status);
    }
  }, [slug]);

  if (!listing) {
    return (
      <div>
        <h1 className="font-display text-3xl text-ink">Listing not found</h1>
        <Link href="/owner/listings" className="mt-4 inline-block text-sm text-forest hover:underline">
          ← Back to listings
        </Link>
      </div>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = {
      ...listing!,
      title: title.trim(),
      rent: Number(rent) || listing!.rent,
      description: description.trim(),
      status,
    };
    upsertOwnerListing(next);
    setListing(next);
    setSaved(true);
  }

  function quickStatus(next: ListingStatus) {
    if (!listing) return;
    const all = setListingStatus(listing.slug, next);
    const updated = all.find((l) => l.slug === listing.slug)!;
    setListing(updated);
    setStatus(next);
  }

  return (
    <div className="max-w-2xl">
      <Link href="/owner/listings" className="text-sm font-medium text-forest hover:underline">
        ← Listings
      </Link>
      <h1 className="mt-4 font-display text-4xl text-ink">{listing.title}</h1>
      <p className="mt-2 text-sm text-ink-muted">
        {listing.street}, {listing.city}, {listing.state} · {formatRent(listing.rent)} · {statusLabel(listing.status)}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["available", "pending", "rented", "draft"] as ListingStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => quickStatus(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium outline outline-1 ${
              status === s
                ? "bg-forest text-paper outline-forest"
                : "bg-surface text-ink outline-line hover:bg-paper"
            }`}
          >
            {statusLabel(s)}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl bg-surface p-6 outline outline-1 outline-line">
        <label className="block">
          <span className="text-sm font-medium text-ink">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Rent</span>
          <input
            type="number"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            Save changes
          </button>
          <Link href={`/properties/${listing.slug}`} className="text-sm font-medium text-forest hover:underline">
            View on customer site
          </Link>
          {saved ? <span className="text-sm text-action">Saved</span> : null}
        </div>
      </form>
    </div>
  );
}
