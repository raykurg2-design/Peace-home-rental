import { Suspense } from "react";
import { Shell } from "@/components/Shell";
import { LoginClient } from "@/components/LoginClient";

export const metadata = {
  title: "Create account",
  description: "Create a Peace Home Rental customer account with email or Apple.",
};

export default function SignupPage() {
  return (
    <Shell>
      <section className="mx-auto max-w-xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Customers</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Create account</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Create a renter account with email or Apple. Email signup sends a 6-digit security code to
          verify your address.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
            <LoginClient mode="signup" />
          </Suspense>
        </div>
      </section>
    </Shell>
  );
}
