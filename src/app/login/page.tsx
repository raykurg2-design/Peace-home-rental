import { Suspense } from "react";
import { Shell } from "@/components/Shell";
import { LoginClient } from "@/components/LoginClient";

export const metadata = {
  title: "Log in",
  description: "Customer login with email security code or Apple Sign In.",
};

export default function LoginPage() {
  return (
    <Shell>
      <section className="mx-auto max-w-xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-action uppercase">Customers</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Log in</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Email login requires your password and a 6-digit security code sent to your inbox. Or continue
          with Apple.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
            <LoginClient mode="login" />
          </Suspense>
        </div>
      </section>
    </Shell>
  );
}
