"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { slugifyTitle, upsertOwnerListing, type ListingStatus } from "@/lib/owner-store";

export default function NewListingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("FL");
  const [zip, setZip] = useState("");
  const [rent, setRent] = useState("1200");
  const [beds, setBeds] = useState("2");
  const [baths, setBaths] = useState("1");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ListingStatus>("draft");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const slugBase = slugifyTitle(title || street) || `home-${Date.now()}`;
    const listing = {
      slug: slugBase,
      title: title.trim() || street.trim(),
      description: description.trim() || "Owner-added listing.",
      rent: Number(rent) || 0,
      beds: Number(beds) || null,
      baths: Number(baths) || null,
      sqft: null,
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim() || null,
      street: street.trim(),
      images: ["/brand/hero.jpg"],
      lat: null,
      lng: null,
      deposit: 500,
      applicationFee: 50,
      amenities: [],
      pets: null,
      neighborhood: null,
      status,
    };
    upsertOwnerListing(listing);
    router.push(`/owner/listings/${listing.slug}`);
  }

  return (
    <div className="max-w-2xl">
      <Link href="/owner/listings" className="text-sm font-medium text-forest hover:underline">
        ← Listings
      </Link>
      <h1 className="mt-4 font-display text-4xl text-ink">Add listing</h1>
      <p className="mt-2 text-sm text-ink-muted">Creates a home in the owner workspace (saved on this device for now).</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl bg-surface p-6 outline outline-1 outline-line">
        <Field label="Title" value={title} onChange={setTitle} required />
        <Field label="Street" value={street} onChange={setStreet} required />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City" value={city} onChange={setCity} required />
          <Field label="State" value={state} onChange={setState} required />
          <Field label="ZIP" value={zip} onChange={setZip} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Rent" value={rent} onChange={setRent} type="number" required />
          <Field label="Beds" value={beds} onChange={setBeds} type="number" />
          <Field label="Baths" value={baths} onChange={setBaths} type="number" />
        </div>
        <label className="block">
          <span className="text-sm font-medium text-ink">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ListingStatus)}
            className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
          >
            <option value="draft">Draft</option>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="rented">Rented</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
        >
          Save listing
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
      />
    </label>
  );
}
