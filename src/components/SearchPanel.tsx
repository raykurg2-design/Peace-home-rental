"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { getMarkets } from "@/lib/listings";

export function SearchPanel({
  initial = {},
  compact = false,
}: {
  initial?: { q?: string; city?: string; beds?: string; maxRent?: string };
  compact?: boolean;
}) {
  const router = useRouter();
  const markets = getMarkets();
  const [q, setQ] = useState(initial.q ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [beds, setBeds] = useState(initial.beds ?? "");
  const [maxRent, setMaxRent] = useState(initial.maxRent ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("city", city);
    if (beds) params.set("beds", beds);
    if (maxRent) params.set("maxRent", maxRent);
    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : "/properties");
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`grid gap-3 rounded-xl bg-surface/95 p-3 shadow-[var(--shadow-soft)] outline outline-1 outline-line backdrop-blur ${
        compact ? "md:grid-cols-[1.4fr_1fr_auto]" : "md:grid-cols-[1.3fr_1fr_0.8fr_0.9fr_auto]"
      }`}
    >
      <label className="block">
        <span className="sr-only">Search</span>
        <div className="flex items-center gap-2 rounded-lg bg-paper px-3 py-2.5 outline outline-1 outline-line">
          <Search size={16} className="text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="City, neighborhood, or ZIP"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
      </label>

      <label className="block">
        <span className="sr-only">Market</span>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-lg bg-paper px-3 py-2.5 text-sm text-ink outline outline-1 outline-line"
        >
          <option value="">All markets</option>
          {markets.map((m) => (
            <option key={m.key} value={m.city}>
              {m.key}
            </option>
          ))}
        </select>
      </label>

      {!compact ? (
        <>
          <label className="block">
            <span className="sr-only">Beds</span>
            <select
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              className="w-full rounded-lg bg-paper px-3 py-2.5 text-sm text-ink outline outline-1 outline-line"
            >
              <option value="">Any beds</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Max rent</span>
            <select
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              className="w-full rounded-lg bg-paper px-3 py-2.5 text-sm text-ink outline outline-1 outline-line"
            >
              <option value="">Any rent</option>
              <option value="1000">Under $1,000</option>
              <option value="1500">Under $1,500</option>
              <option value="2000">Under $2,000</option>
              <option value="3000">Under $3,000</option>
            </select>
          </label>
        </>
      ) : null}

      <button
        type="submit"
        className="rounded-lg bg-forest px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-forest-deep"
      >
        Search
      </button>
    </form>
  );
}
