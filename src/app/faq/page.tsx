import Link from "next/link";
import { Shell } from "@/components/Shell";
import { OFFICE } from "@/lib/listings";

export const metadata = {
  title: "FAQ",
  description: "Common questions about renting with Peace Home Rental.",
};

const faqs = [
  {
    q: "How do I schedule a showing?",
    a: "Create a renter account, verify your email, add a phone number, and accept rental policies. Then open any listing and choose Request a tour, or call the office.",
  },
  {
    q: "Why do I need email and customer verification?",
    a: "We confirm your email and contact details before tours or applications so the office can follow up with the right person. Open Account in the menu to get verified.",
  },
  {
    q: "What does it cost to apply?",
    a: "Each listing shows the application fee before you start. You are not charged until you confirm and submit. You must be a verified customer to send an application interest request.",
  },
  {
    q: "What income and credit do you require?",
    a: "Household gross income of at least 3× rent. Credit is typically 680 with no recent collections, evictions, or bankruptcies. Listing pages may add details.",
  },
  {
    q: "Are pets allowed?",
    a: "It depends on the home. Check the listing. When pets are considered, an additional pet deposit may apply.",
  },
  {
    q: "How long is a typical lease?",
    a: "Most homes are offered on a 12-month lease. Ask about start date and lease length when you tour.",
  },
  {
    q: "Do you take online rent payments?",
    a: "Payment instructions are provided after you are approved and signed. Do not send money before a written lease.",
  },
];

export default function FaqPage() {
  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Help</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Frequently asked questions</h1>
        <p className="mt-4 text-lg text-ink-muted">Straight answers about searching, touring, and applying.</p>

        <dl className="mt-12 space-y-8">
          {faqs.map((item) => (
            <div key={item.q} className="border-b border-line pb-8">
              <dt className="font-display text-2xl text-ink">{item.q}</dt>
              <dd className="mt-3 text-ink-muted">{item.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
          <h2 className="font-display text-3xl text-forest">Still have a question?</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Call {OFFICE.phone} or email {OFFICE.email}. We usually reply within one business day.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
            >
              Contact the office
            </Link>
            <Link
              href="/rental-policies"
              className="rounded-md bg-paper px-5 py-3 text-sm font-semibold text-forest outline outline-1 outline-line"
            >
              Rental policies
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
