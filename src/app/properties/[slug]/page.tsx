import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Shell } from "@/components/Shell";
import { PropertyCard } from "@/components/PropertyCard";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { TrackRecent } from "@/components/TrackRecent";
import {
  formatBedsBaths,
  formatRent,
  getListing,
  listings,
  mapsUrl,
  OFFICE,
  relatedListings,
} from "@/lib/listings";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listings.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const listing = getListing(slug);
  if (!listing) return { title: "Home not found" };
  return {
    title: `${listing.title} for rent`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: `${listing.title} · ${formatRent(listing.rent)}/mo`,
      description: `${listing.street}, ${listing.city}, ${listing.state}`,
      images: listing.images[0] ? [{ url: listing.images[0] }] : undefined,
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const listing = getListing(slug);
  if (!listing) notFound();

  const image = listing.images[0] ?? "/brand/hero.jpg";
  const remote = image.startsWith("http");
  const related = relatedListings(listing, 3);
  const address = `${listing.street}, ${listing.city}, ${listing.state}${listing.zip ? ` ${listing.zip}` : ""}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: `${listing.title} for rent`,
    description: listing.description,
    url: `https://peacehomerental.com/properties/${listing.slug}`,
    image: listing.images,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.street,
      addressLocality: listing.city,
      addressRegion: listing.state,
      postalCode: listing.zip,
      addressCountry: "US",
    },
    offers: {
      "@type": "Offer",
      price: listing.rent,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <Shell>
      <TrackRecent slug={listing.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="text-sm text-ink-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-forest">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/properties" className="hover:text-forest">
              Homes
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{listing.city}</span>
          </nav>
          <div className="flex items-center gap-2">
            <FavoriteButton
              slug={listing.slug}
              label
              className="rounded-md bg-paper px-3 py-2 text-forest outline outline-1 outline-line hover:bg-surface"
            />
            <ShareButton title={listing.title} />
          </div>
        </div>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-line">
              <Image
                src={image}
                alt={listing.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                unoptimized={remote}
              />
              <div className="absolute left-4 top-4 rounded-md bg-forest px-3 py-1.5 text-xs font-semibold tracking-wide text-paper uppercase">
                Available now
              </div>
            </div>

            <div className="mt-8">
              <h1 className="font-display text-4xl text-ink sm:text-5xl">{listing.title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-ink-muted">
                <span>{address}</span>
                <a
                  href={mapsUrl(listing)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-forest hover:underline"
                >
                  <MapPin size={14} /> Map
                </a>
              </p>
              <p className="mt-2 text-forest">{formatBedsBaths(listing)}</p>
              {listing.neighborhood ? (
                <p className="mt-1 text-sm text-ink-muted">Neighborhood: {listing.neighborhood}</p>
              ) : null}
              <p className="mt-6 max-w-3xl text-base leading-relaxed text-ink/90">{listing.description}</p>

              {listing.amenities.length ? (
                <div className="mt-8">
                  <h2 className="font-display text-2xl text-ink">Amenities</h2>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {listing.amenities.map((a) => (
                      <li
                        key={a}
                        className="rounded-full bg-paper px-3 py-1.5 text-sm text-forest outline outline-1 outline-line"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <TrustItem title="Clear fees" body="Rent, deposit, and application fee shown up front." />
                <TrustItem title="In-person tours" body="We confirm a time and walk the home with you." />
                <TrustItem title="Fair housing" body="Equal Housing Opportunity for every qualified renter." />
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl bg-surface p-6 outline outline-1 outline-line lg:sticky lg:top-24">
            <p className="text-xs font-semibold tracking-[0.18em] text-ink-muted uppercase">Monthly rent</p>
            <p className="mt-2 font-display text-5xl text-forest tabular-nums">{formatRent(listing.rent)}</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-line pb-3">
                <dt className="text-ink-muted">Security deposit</dt>
                <dd className="font-medium tabular-nums">{formatRent(listing.deposit)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line pb-3">
                <dt className="text-ink-muted">Application fee</dt>
                <dd className="font-medium tabular-nums">{formatRent(listing.applicationFee)}</dd>
              </div>
              {listing.pets ? (
                <div className="flex justify-between gap-4 border-b border-line pb-3">
                  <dt className="text-ink-muted">Pets</dt>
                  <dd className="max-w-[55%] text-right font-medium">{listing.pets}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4 pb-1">
                <dt className="text-ink-muted">Lease</dt>
                <dd className="font-medium">Typically 12 months</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`/apply?home=${listing.slug}`}
                className="rounded-md bg-forest px-4 py-3 text-center text-sm font-semibold text-paper hover:bg-forest-deep"
              >
                Apply for this home
              </Link>
              <Link
                href={`/tour?home=${listing.slug}`}
                className="rounded-md bg-paper px-4 py-3 text-center text-sm font-semibold text-forest outline outline-1 outline-line hover:bg-surface"
              >
                Request a tour
              </Link>
              <a href={OFFICE.phoneHref} className="text-center text-sm font-medium text-forest hover:underline">
                Call {OFFICE.phone}
              </a>
            </div>
            <p className="mt-5 text-xs text-ink-muted">
              Equal Housing Opportunity. Apply does not charge you until you confirm the fee.
            </p>
          </aside>
        </div>

        {related.length ? (
          <section className="mt-16 border-t border-line pt-12">
            <h2 className="font-display text-3xl text-ink">Similar homes</h2>
            <p className="mt-2 text-ink-muted">More listings you may want to compare.</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PropertyCard key={item.slug} listing={item} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </Shell>
  );
}

function TrustItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-paper p-4 outline outline-1 outline-line">
      <p className="font-display text-xl text-forest">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{body}</p>
    </div>
  );
}
