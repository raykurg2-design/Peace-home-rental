import Link from "next/link";
import { Shell } from "@/components/Shell";
import { InquiryForm } from "@/components/InquiryForm";
import { getListing, OFFICE } from "@/lib/listings";

type Props = {
  searchParams: Promise<{ home?: string }>;
};

export const metadata = {
  title: "Apply",
  description: "Start a Peace Home Rental application from your phone.",
};

export default async function ApplyPage({ searchParams }: Props) {
  const { home } = await searchParams;
  const listing = home ? getListing(home) : undefined;

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Apply</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Apply from your phone</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Tell us which home you want. The office replies with the application and fee before you pay anything.
        </p>

        {listing ? (
          <div className="mt-8 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
            <p className="text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase">Selected home</p>
            <h2 className="mt-2 font-display text-3xl text-forest">{listing.title}</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {listing.street}, {listing.city}, {listing.state}
            </p>
            <p className="mt-3 text-sm text-ink">
              Application fee shown on listing: ${listing.applicationFee}. Deposit: ${listing.deposit}.
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
            kind="apply"
            title="Application interest"
            intro="This goes to the office. The application fee is confirmed before you pay anything."
            defaultMessage={
              listing
                ? `I would like to apply for ${listing.title} at ${listing.street}, ${listing.city}, ${listing.state}.`
                : "I would like to start a rental application."
            }
            submitLabel="Send to office"
          />
        </div>

        <p className="mt-6 text-sm text-ink-muted">
          Or call{" "}
          <a href={OFFICE.phoneHref} className="font-medium text-forest hover:underline">
            {OFFICE.phone}
          </a>
        </p>
      </section>
    </Shell>
  );
}
