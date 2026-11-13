import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import {
  formatBedsBaths,
  formatRent,
  getListing,
  listings,
  OFFICE,
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
  };
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const listing = getListing(slug);
  if (!listing) notFound();

  const image = listing.images[0] ?? "/brand/hero.jpg";
  const remote = image.startsWith("http");

  return (
    <Shell>
      <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link href="/properties" className="text-sm font-medium text-forest hover:underline">
          ← All homes
        </Link>

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
            </div>
            <div className="mt-8">
              <h1 className="font-display text-4xl text-ink sm:text-5xl">{listing.title}</h1>
              <p className="mt-2 text-ink-muted">
                {listing.street}, {listing.city}, {listing.state}
                {listing.zip ? ` ${listing.zip}` : ""}
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
                  <dd className="font-medium text-right">{listing.pets}</dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`/apply?home=${listing.slug}`}
                className="rounded-md bg-forest px-4 py-3 text-center text-sm font-semibold text-paper hover:bg-forest-deep"
              >
                Apply for this home
              </Link>
              <a
                href={OFFICE.phoneHref}
                className="rounded-md bg-paper px-4 py-3 text-center text-sm font-semibold text-forest outline outline-1 outline-line hover:bg-surface"
              >
                Call to tour
              </a>
              <a
                href={`${OFFICE.emailHref}?subject=${encodeURIComponent(`Tour request: ${listing.title}`)}`}
                className="text-center text-sm font-medium text-forest hover:underline"
              >
                Email about this listing
              </a>
            </div>
            <p className="mt-5 text-xs text-ink-muted">
              Equal Housing Opportunity. Apply does not charge you until you confirm the fee.
            </p>
          </aside>
        </div>
      </article>
    </Shell>
  );
}
