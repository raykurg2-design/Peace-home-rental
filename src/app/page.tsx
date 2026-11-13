import Image from "next/image";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchPanel } from "@/components/SearchPanel";
import {
  featuredListings,
  formatRent,
  getMarkets,
  OFFICE,
  stats,
} from "@/lib/listings";

export default function HomePage() {
  const markets = getMarkets();
  const featured = featuredListings(6);
  const s = stats();

  return (
    <Shell overlayHeader>
      <section className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="/brand/hero.jpg"
          alt="A Peace Home Rental property exterior"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/60 to-forest-deep/45" />
        <div className="hero-glow pointer-events-none absolute -right-20 top-24 size-72 rounded-full bg-clay/25 blur-3xl" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-12 pt-28 sm:px-6 sm:pb-16">
          <p className="animate-rise text-xs font-semibold tracking-[0.24em] text-paper/80 uppercase">
            {OFFICE.name}
          </p>
          <h1 className="animate-rise-delay mt-3 max-w-3xl font-display text-5xl text-paper sm:text-7xl">
            Find Your Perfect Home
          </h1>
          <p className="animate-rise-delay-2 mt-4 max-w-xl text-base text-paper/85 sm:text-lg">
            Private homes. Trusted listings. Search by city, neighborhood, or ZIP code.
          </p>
          <div className="animate-rise-delay-2 mt-8 max-w-4xl">
            <SearchPanel compact />
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface/70">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-4 py-8 sm:px-6">
          <Stat label="Homes on the list" value={String(s.homes)} />
          <Stat label="Markets" value={String(s.markets)} />
          <Stat label="Rents from" value={formatRent(s.from)} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl text-ink sm:text-5xl">Where we rent</h2>
          <p className="mt-3 text-ink-muted">
            Current listings span California, Florida, New Jersey, New York, and Oregon. Open a city to see what is
            available today.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {markets.map((m) => (
            <Link
              key={m.key}
              href={`/properties?city=${encodeURIComponent(m.city)}`}
              className="rounded-xl bg-surface px-5 py-5 outline outline-1 outline-line transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            >
              <p className="font-display text-2xl text-forest">
                {m.city}, {m.state}
              </p>
              <p className="mt-1 text-sm text-ink-muted tabular-nums">
                {m.count} {m.count === 1 ? "home" : "homes"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-forest-deep/95 py-16 text-paper sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl sm:text-5xl">Featured homes</h2>
              <p className="mt-3 text-paper/75">
                Photos, rent, beds, and deposit on each listing. Apply when you are ready.
              </p>
            </div>
            <Link
              href="/properties"
              className="rounded-md bg-paper px-4 py-2.5 text-sm font-semibold text-forest transition hover:bg-surface"
            >
              View all homes
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing) => (
              <div key={listing.slug} className="[&_a]:bg-surface [&_h3]:text-ink [&_p]:text-ink-muted">
                <PropertyCard listing={listing} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl text-ink sm:text-5xl">How renting works</h2>
          <p className="mt-3 text-ink-muted">One office. A clear path. No surprise fees after you apply.</p>
        </div>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: "01",
              t: "Search listings",
              d: "Filter by city, beds, and rent. Every pin is a Peace Home listing we manage.",
            },
            {
              n: "02",
              t: "Tour in person",
              d: "Request a showing from the listing. We confirm a time and walk the home with you.",
            },
            {
              n: "03",
              t: "Apply online",
              d: "Submit from your phone. The application fee is shown before you start.",
            },
            {
              n: "04",
              t: "Lease, then keys",
              d: "After approval: refundable deposit, a written lease, and keys on the start date.",
            },
          ].map((step) => (
            <li key={step.n}>
              <p className="font-display text-3xl text-action">{step.n}</p>
              <h3 className="mt-2 font-display text-2xl text-ink">{step.t}</h3>
              <p className="mt-2 text-sm text-ink-muted">{step.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Link href="/how-it-works" className="text-sm font-semibold text-forest underline-offset-4 hover:underline">
            Read the full process
          </Link>
        </div>
      </section>

      <section className="bg-forest-deep py-16 text-paper sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-4xl sm:text-5xl">Rent with confidence</h2>
          <p className="mt-3 max-w-2xl text-paper/75">
            Clear fees, fair screening, and a real office behind every listing.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="font-display text-2xl">No surprise fees</p>
              <p className="mt-2 text-sm text-paper/70">Rent, deposit, and application fee are shown before you apply.</p>
            </div>
            <div>
              <p className="font-display text-2xl">Reply within a day</p>
              <p className="mt-2 text-sm text-paper/70">Tour and application requests typically get a response the next business day.</p>
            </div>
            <div>
              <p className="font-display text-2xl">Equal Housing</p>
              <p className="mt-2 text-sm text-paper/70">
                We welcome every qualified renter.{" "}
                <Link href="/rental-policies" className="underline underline-offset-2 hover:text-paper">
                  Read policies
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-ink sm:text-4xl">Ready to look?</h2>
            <p className="mt-2 text-ink-muted">
              Call the office or browse homes now. Listings move — what you see here is what we are showing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={OFFICE.phoneHref}
              className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
            >
              Call {OFFICE.phone}
            </a>
            <Link
              href="/contact"
              className="rounded-md bg-paper px-5 py-3 text-sm font-semibold text-forest outline outline-1 outline-line hover:bg-surface"
            >
              Email the office
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-3xl text-forest sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs tracking-[0.14em] text-ink-muted uppercase sm:text-sm">{label}</p>
    </div>
  );
}
