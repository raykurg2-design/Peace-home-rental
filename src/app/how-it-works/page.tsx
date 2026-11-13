import Link from "next/link";
import { Shell } from "@/components/Shell";

export const metadata = {
  title: "How it works",
  description: "How renting with Peace Home Rental works — search, tour, apply, lease, keys.",
};

const steps = [
  {
    title: "Search listings",
    body: "Filter by city, beds, and rent. Every home is a Peace Home listing we manage.",
  },
  {
    title: "Tour in person",
    body: "Request a showing from the listing page. We confirm a time and walk the home with you.",
  },
  {
    title: "Apply online",
    body: "Submit from your phone. The application fee is shown before you start. Apply does not charge you until you confirm.",
  },
  {
    title: "Lease, then keys",
    body: "After approval you get a refundable deposit amount, a written lease, and keys on the start date.",
  },
];

export default function HowItWorksPage() {
  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Process</p>
        <h1 className="mt-3 font-display text-5xl text-ink">How renting works</h1>
        <p className="mt-4 text-lg text-ink-muted">One office. A clear path. No surprise fees after you apply.</p>
        <ol className="mt-12 space-y-8">
          {steps.map((step, i) => (
            <li key={step.title} className="grid gap-3 border-b border-line pb-8 sm:grid-cols-[4rem_1fr]">
              <p className="font-display text-3xl text-action">{String(i + 1).padStart(2, "0")}</p>
              <div>
                <h2 className="font-display text-3xl text-ink">{step.title}</h2>
                <p className="mt-2 text-ink-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link
          href="/properties"
          className="mt-10 inline-flex rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
        >
          Browse homes
        </Link>
      </section>
    </Shell>
  );
}
