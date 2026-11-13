import { Suspense } from "react";
import { Shell } from "@/components/Shell";
import { MessagesClient } from "@/components/MessagesClient";

export const metadata = {
  title: "Messages",
  description: "Message the Peace Home Rental office about homes, tours, and applications.",
};

export default function MessagesPage() {
  return (
    <Shell>
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Messages</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Talk with the office</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Ask about a home, follow up on a tour, or continue an application conversation. Replies stay in this
          thread.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
            <MessagesClient mode="customer" />
          </Suspense>
        </div>
      </section>
    </Shell>
  );
}
