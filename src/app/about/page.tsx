import { Shell } from "@/components/Shell";
import { OFFICE } from "@/lib/listings";

export const metadata = {
  title: "About",
  description: "About Peace Home Rental — private homes, trusted listings, and a clear path to keys.",
};

export default function AboutPage() {
  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">About</p>
        <h1 className="mt-3 font-display text-5xl text-ink">One office for private rentals</h1>
        <p className="mt-5 text-lg text-ink-muted">
          {OFFICE.name} manages private homes across multiple markets. We keep listings clear, photography honest, and
          the path from tour to lease straightforward.
        </p>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-ink/90">
          <p>
            Renters deserve to know the rent, deposit, and application fee before they start. Owners deserve tenants who
            meet clear standards. We work both sides of that agreement from an office based in {OFFICE.city},{" "}
            {OFFICE.state}.
          </p>
          <p>
            Every listing on this site is a home we manage. Search by city, request a showing, and apply from your phone.
            What you see here is what we are actively showing.
          </p>
        </div>
        <div className="mt-12 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
          <h2 className="font-display text-3xl text-forest">Who we approve</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-muted">
            <li>Gross household income of at least 3× monthly rent.</li>
            <li>Credit typically 680, with no recent collections, evictions, or bankruptcies.</li>
            <li>Verifiable rental and income history.</li>
            <li>Equal Housing Opportunity — we welcome every qualified renter.</li>
          </ul>
        </div>
      </section>
    </Shell>
  );
}
