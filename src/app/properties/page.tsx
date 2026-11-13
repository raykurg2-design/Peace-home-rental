import { Shell } from "@/components/Shell";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchPanel } from "@/components/SearchPanel";
import { searchListings } from "@/lib/listings";

type Props = {
  searchParams: Promise<{ q?: string; city?: string; beds?: string; maxRent?: string }>;
};

export const metadata = {
  title: "Homes for rent",
  description: "Browse Peace Home Rental listings by city, beds, and rent.",
};

export default async function PropertiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const results = searchListings(params);

  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Listings</p>
          <h1 className="mt-2 font-display text-5xl text-ink">Homes for rent</h1>
          <p className="mt-3 text-ink-muted">
            Filter by city, beds, and rent. Every home is managed by Peace Home Rental.
          </p>
        </div>
        <div className="mt-8">
          <SearchPanel initial={params} />
        </div>
        <p className="mt-6 text-sm text-ink-muted tabular-nums">
          {results.length} {results.length === 1 ? "home" : "homes"}
          {params.city ? ` in ${params.city}` : ""}
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((listing) => (
            <PropertyCard key={listing.slug} listing={listing} />
          ))}
        </div>
        {results.length === 0 ? (
          <div className="mt-10 rounded-xl bg-surface p-8 outline outline-1 outline-line">
            <h2 className="font-display text-3xl text-ink">No homes match</h2>
            <p className="mt-2 text-ink-muted">Try another city or clear a filter to see more listings.</p>
          </div>
        ) : null}
      </section>
    </Shell>
  );
}
