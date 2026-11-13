"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { OFFICE, type Listing } from "@/lib/listings";
import { addInquiry } from "@/lib/owner-store";

export function ApplyForm({ listing }: { listing?: Listing }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    listing
      ? `I would like to apply for ${listing.title} at ${listing.street}, ${listing.city}, ${listing.state}.`
      : "I would like to start a rental application.",
  );
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    addInquiry({
      listingSlug: listing?.slug ?? "general",
      listingTitle: listing?.title ?? "General application",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-8 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <h2 className="font-display text-3xl text-forest">Request received</h2>
        <p className="mt-2 text-ink-muted">
          The office can see this in the owner workspace. You can also call or email directly.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={OFFICE.phoneHref}
            className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            Call {OFFICE.phone}
          </a>
          <Link href="/properties" className="rounded-md bg-paper px-5 py-3 text-sm font-semibold text-forest outline outline-1 outline-line">
            Keep browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
      <h2 className="font-display text-3xl text-ink">Application interest</h2>
      <p className="text-sm text-ink-muted">
        This goes to the owner workspace. The application fee is confirmed before you pay anything.
      </p>
      <label className="block">
        <span className="text-sm font-medium text-ink">Full name</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">Email</span>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">Phone</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
        />
      </label>
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
      <button
        type="submit"
        className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
      >
        Send to office
      </button>
    </form>
  );
}
