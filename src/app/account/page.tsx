import Link from "next/link";
import { Shell } from "@/components/Shell";
import { AccountPanel } from "@/components/AccountPanel";
import { ActivityFeed } from "@/components/ActivityFeed";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export const metadata = {
  title: "Account",
  description: "Create or manage your Peace Home Rental renter account.",
};

export default async function AccountPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const nextHref =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  return (
    <Shell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Renter account</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Email &amp; customer verification</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Verify your email, confirm a phone number, and accept policies before tours, applications, or
          messaging the office.
        </p>
        <div className="mt-8">
          <AccountPanel nextHref={nextHref} />
        </div>

        <div className="mt-10 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl text-ink">Your activity</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Verification, inquiries, messages, and office updates.
              </p>
            </div>
            <Link href="/messages" className="text-sm font-semibold text-forest hover:underline">
              Open messages
            </Link>
          </div>
          <div className="mt-6">
            <ActivityFeed
              endpoint="/api/customer/activity"
              emptyLabel="Sign in to see your rental activity here."
            />
          </div>
        </div>
      </section>
    </Shell>
  );
}
