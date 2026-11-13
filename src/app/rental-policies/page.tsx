import { Shell } from "@/components/Shell";
import { OFFICE } from "@/lib/listings";

export const metadata = {
  title: "Rental policies",
  description: "Screening, deposits, fair housing, and office policies for Peace Home Rental.",
};

export default function RentalPoliciesPage() {
  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Policies</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Rental policies</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Clear standards protect both renters and owners. Individual listings may add home-specific terms.
        </p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-ink/90">
          <section>
            <h2 className="font-display text-3xl text-forest">Screening</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-muted">
              <li>Gross household income of at least 3× monthly rent</li>
              <li>Credit typically 680, with no recent collections, evictions, or bankruptcies</li>
              <li>Verifiable rental and income history</li>
              <li>Application fee is disclosed on the listing before you submit</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-3xl text-forest">Deposits and fees</h2>
            <p className="mt-3 text-ink-muted">
              Security deposits and application fees are shown on each listing. Deposits are refundable per the written
              lease and applicable law. {OFFICE.name} does not collect rent or deposits through unsolicited messages —
              only through official lease instructions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-forest">Equal Housing Opportunity</h2>
            <p className="mt-3 text-ink-muted">
              We welcome every qualified renter. We do not discriminate on the basis of race, color, religion, sex,
              disability, familial status, national origin, or any other protected class under federal, state, or local
              fair housing law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-forest">Showings and occupancy</h2>
            <p className="mt-3 text-ink-muted">
              Homes are shown by appointment. Keys are released after approval, a signed lease, and receipt of required
              move-in funds. Occupancy limits follow the lease and local code.
            </p>
          </section>
        </div>
      </section>
    </Shell>
  );
}
