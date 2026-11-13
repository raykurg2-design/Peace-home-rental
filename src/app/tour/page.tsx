import Link from "next/link";
import { Shell } from "@/components/Shell";
import { InquiryForm } from "@/components/InquiryForm";
import { getListing } from "@/lib/listings";

type Props = { searchParams: Promise<{ home?: string }> };

export const metadata = {
  title: "Request a tour",
  description: "Schedule an in-person showing with Peace Home Rental.",
};

export default async function TourPage({ searchParams }: Props) {
  const { home } = await searchParams;
  const listing = home ? getListing(home) : undefined;

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Showings</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Request a tour</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Tell us when you can visit. We confirm a time and walk the home with you.
        </p>

        {listing ? (
          <div className="mt-8 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
            <p className="text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase">Home to tour</p>
            <h2 className="mt-2 font-display text-3xl text-forest">{listing.title}</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {listing.street}, {listing.city}, {listing.state}
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
            <p className="text-ink-muted">No home selected yet.</p>
            <Link href="/properties" className="mt-3 inline-block text-sm font-semibold text-forest hover:underline">
              Choose a listing first
            </Link>
          </div>
        )}

        <div className="mt-8">
          <InquiryForm
            listing={listing}
            kind="tour"
            title="Tour request"
            intro="Share a few preferred days or times. We reply to confirm."
            defaultMessage={
              listing
                ? `I would like to tour ${listing.title}. Preferred times: `
                : "I would like to schedule a tour. Preferred times: "
            }
            submitLabel="Request tour"
          />
        </div>
      </section>
    </Shell>
  );
}
