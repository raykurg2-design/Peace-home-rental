import { Shell } from "@/components/Shell";
import { AccountPanel } from "@/components/AccountPanel";

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
      <section className="mx-auto max-w-xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Renter account</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Email &amp; customer verification</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Verify your email, confirm a phone number, and accept policies before tours or applications.
        </p>
        <div className="mt-8">
          <AccountPanel nextHref={nextHref} />
        </div>
      </section>
    </Shell>
  );
}
