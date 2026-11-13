import Link from "next/link";
import { Shell } from "@/components/Shell";
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

  const subject = listing
    ? `Application interest: ${listing.title}`
    : "Application interest — Peace Home Rental";
  const body = listing
    ? `Hello Peace Home Rental,\n\nI would like to apply for ${listing.title} at ${listing.street}, ${listing.city}, ${listing.state}.\n\nPlease send the application link and next steps.\n\nThank you.`
    : `Hello Peace Home Rental,\n\nI would like to start a rental application. Please send the next steps.\n\nThank you.`;

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Apply</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Apply from your phone</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Tell us which home you want. We reply with the application and the fee before you pay anything.
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

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`${OFFICE.emailHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
            className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            Email to start application
          </a>
          <a
            href={OFFICE.phoneHref}
            className="rounded-md bg-paper px-5 py-3 text-sm font-semibold text-forest outline outline-1 outline-line hover:bg-surface"
          >
            Call {OFFICE.phone}
          </a>
        </div>
      </section>
    </Shell>
  );
}
