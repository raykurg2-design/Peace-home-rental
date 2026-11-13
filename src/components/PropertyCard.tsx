import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatBedsBaths, formatRent, type Listing } from "@/lib/listings";

export function PropertyCard({ listing }: { listing: Listing }) {
  const image = listing.images[0] ?? "/brand/hero.jpg";
  const remote = image.startsWith("http");

  return (
    <article className="group relative overflow-hidden rounded-xl bg-surface outline outline-1 outline-line transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton
          slug={listing.slug}
          className="grid size-9 place-items-center rounded-full bg-surface/95 text-forest shadow-sm outline outline-1 outline-line"
        />
      </div>
      <Link href={`/properties/${listing.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-line">
          <Image
            src={image}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            unoptimized={remote}
          />
          <div className="absolute left-3 top-3 rounded-md bg-forest/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-paper uppercase">
            Available
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/70 to-transparent p-4 pt-12">
            <p className="text-lg font-semibold text-paper tabular-nums">{formatRent(listing.rent)}/mo</p>
          </div>
        </div>
        <div className="space-y-1 p-4">
          <h3 className="font-display text-2xl text-ink">{listing.title}</h3>
          <p className="text-sm text-ink-muted">
            {listing.street}, {listing.city}, {listing.state}
          </p>
          <p className="text-sm text-forest">{formatBedsBaths(listing)}</p>
        </div>
      </Link>
    </article>
  );
}
