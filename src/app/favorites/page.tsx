"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { PropertyCard } from "@/components/PropertyCard";
import { loadFavorites } from "@/lib/favorites";
import { getListing } from "@/lib/listings";

export default function FavoritesPage() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(loadFavorites());
    const onStorage = () => setSlugs(loadFavorites());
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, []);

  const homes = slugs.map((s) => getListing(s)).filter(Boolean);

  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Saved</p>
        <h1 className="mt-2 font-display text-5xl text-ink">Saved homes</h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Keep homes you like while you compare. Saved on this device until you clear them.
        </p>

        {homes.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {homes.map((listing) => (listing ? <PropertyCard key={listing.slug} listing={listing} /> : null))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl bg-surface p-8 outline outline-1 outline-line">
            <h2 className="font-display text-3xl text-ink">No saved homes yet</h2>
            <p className="mt-2 text-ink-muted">Tap the heart on any listing to save it here.</p>
            <Link
              href="/properties"
              className="mt-5 inline-flex rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
            >
              Browse homes
            </Link>
          </div>
        )}
      </section>
    </Shell>
  );
}
