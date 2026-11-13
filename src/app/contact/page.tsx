import { Shell } from "@/components/Shell";
import { OFFICE } from "@/lib/listings";

export const metadata = {
  title: "Contact",
  description: "Contact Peace Home Rental for tours, applications, and office questions.",
};

export default function ContactPage() {
  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Contact</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Talk with the office</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Questions about a listing, a tour, or an application — reach us directly.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href={OFFICE.phoneHref}
            className="rounded-2xl bg-surface p-6 outline outline-1 outline-line transition hover:shadow-[var(--shadow-soft)]"
          >
            <p className="text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase">Phone</p>
            <p className="mt-3 font-display text-3xl text-forest">{OFFICE.phone}</p>
          </a>
          <a
            href={OFFICE.emailHref}
            className="rounded-2xl bg-surface p-6 outline outline-1 outline-line transition hover:shadow-[var(--shadow-soft)]"
          >
            <p className="text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase">Email</p>
            <p className="mt-3 break-all font-display text-2xl text-forest sm:text-3xl">{OFFICE.email}</p>
          </a>
        </div>

        <form
          action={OFFICE.emailHref}
          method="get"
          className="mt-10 space-y-4 rounded-2xl bg-surface p-6 outline outline-1 outline-line"
        >
          <h2 className="font-display text-3xl text-ink">Send a note</h2>
          <p className="text-sm text-ink-muted">Opens your email app with the office address filled in.</p>
          <label className="block">
            <span className="text-sm font-medium text-ink">Subject</span>
            <input
              name="subject"
              defaultValue="Peace Home Rental inquiry"
              className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Message</span>
            <textarea
              name="body"
              rows={5}
              placeholder="Which home are you asking about?"
              className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            Open email
          </button>
        </form>
      </section>
    </Shell>
  );
}
