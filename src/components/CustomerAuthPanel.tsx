"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppleSignInButton } from "@/components/AppleSignInButton";
import { fetchCustomer, type CustomerPublic } from "@/lib/customer-client";

type Mode = "login" | "signup";

export function CustomerAuthPanel({
  mode,
  nextHref = "/account",
}: {
  mode: Mode;
  nextHref?: string;
}) {
  const [customer, setCustomer] = useState<CustomerPublic | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [acceptPolicies, setAcceptPolicies] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCustomer().then((c) => {
      if (!cancelled) {
        setCustomer(c);
        if (c?.phone) setPhone(c.phone);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function startEmailAuth(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setPreviewCode(null);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/customer/signup", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = (await res.json()) as {
          error?: string;
          customer?: CustomerPublic;
          challengeId?: string;
          email?: { previewCode?: string | null };
        };
        if (!res.ok) {
          setError(data.error ?? "Could not create account.");
          return;
        }
        if (data.customer) setCustomer(data.customer);
        setChallengeId(data.challengeId ?? null);
        setPreviewCode(data.email?.previewCode ?? null);
        return;
      }

      const res = await fetch("/api/customer/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        error?: string;
        challengeId?: string;
        previewCode?: string | null;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not start sign-in.");
        return;
      }
      setChallengeId(data.challengeId ?? null);
      setPreviewCode(data.previewCode ?? null);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    if (!challengeId) return;
    setBusy(true);
    setError(null);
    try {
      const path =
        mode === "signup" || (customer && !customer.emailVerified)
          ? "/api/customer/signup/verify"
          : "/api/customer/login/verify";
      const res = await fetch(path, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, code }),
      });
      const data = (await res.json()) as { error?: string; customer?: CustomerPublic };
      if (!res.ok) {
        setError(data.error ?? "Invalid security code.");
        return;
      }
      if (data.customer) setCustomer(data.customer);
      setChallengeId(null);
      setPreviewCode(null);
      setCode("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function completeVerification(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/customer/verify-profile", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, acceptPolicies }),
      });
      const data = (await res.json()) as { error?: string; customer?: CustomerPublic };
      if (!res.ok) {
        setError(data.error ?? "Could not verify.");
        return;
      }
      if (data.customer) setCustomer(data.customer);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    await fetch("/api/customer/logout", { method: "POST", credentials: "same-origin" });
    setCustomer(null);
    setChallengeId(null);
    setPreviewCode(null);
    setBusy(false);
  }

  if (customer === undefined) {
    return (
      <div className="rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <p className="text-sm text-ink-muted">Loading account…</p>
      </div>
    );
  }

  if (customer && !customer.emailVerified && challengeId) {
    return (
      <SecurityCodeForm
        email={customer.email}
        code={code}
        setCode={setCode}
        previewCode={previewCode}
        error={error}
        busy={busy}
        onSubmit={verifyCode}
        onCancel={logout}
        title="Enter your security code"
        intro={`We emailed a 6-digit code to ${customer.email}. Enter it to verify your account.`}
      />
    );
  }

  if (customer && !customer.emailVerified) {
    return (
      <div className="space-y-4 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <h2 className="font-display text-3xl text-ink">Email not verified</h2>
        <p className="text-sm text-ink-muted">
          Finish creating your account from the signup form, or sign out and try again.
        </p>
        <button
          type="button"
          onClick={logout}
          className="rounded-md bg-paper px-5 py-3 text-sm font-semibold text-forest outline outline-1 outline-line"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (customer && !customer.customerVerified) {
    return (
      <form
        onSubmit={completeVerification}
        className="space-y-4 rounded-2xl bg-surface p-6 outline outline-1 outline-line"
      >
        <h2 className="font-display text-3xl text-ink">Complete customer verification</h2>
        <p className="text-sm text-ink-muted">
          Email confirmed for {customer.name}. Add a phone number and accept rental policies to unlock
          tours, applications, and messaging.
        </p>
        <label className="block">
          <span className="text-sm font-medium text-ink">Phone</span>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
          />
        </label>
        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="mt-1"
            checked={acceptPolicies}
            onChange={(e) => setAcceptPolicies(e.target.checked)}
          />
          <span>
            I have read and accept the{" "}
            <Link href="/rental-policies" className="font-semibold text-forest hover:underline">
              rental policies
            </Link>
            .
          </span>
        </label>
        {error ? <p className="text-sm text-clay-deep">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep disabled:opacity-60"
          >
            Mark me verified
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={logout}
            className="rounded-md bg-paper px-5 py-3 text-sm font-semibold text-forest outline outline-1 outline-line"
          >
            Sign out
          </button>
        </div>
      </form>
    );
  }

  if (customer?.customerVerified) {
    return (
      <div className="space-y-4 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <h2 className="font-display text-3xl text-ink">You&apos;re signed in</h2>
        <p className="text-sm text-ink-muted">
          {customer.name} · {customer.email}
          {customer.phone ? ` · ${customer.phone}` : ""}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={nextHref}
            className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            Continue
          </Link>
          <Link
            href="/account"
            className="rounded-md bg-paper px-5 py-3 text-sm font-semibold text-forest outline outline-1 outline-line"
          >
            Account
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={logout}
            className="rounded-md bg-paper px-5 py-3 text-sm font-semibold text-forest outline outline-1 outline-line"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (challengeId && mode === "login") {
    return (
      <SecurityCodeForm
        email={email}
        code={code}
        setCode={setCode}
        previewCode={previewCode}
        error={error}
        busy={busy}
        onSubmit={verifyCode}
        onCancel={() => {
          setChallengeId(null);
          setPreviewCode(null);
          setCode("");
        }}
        title="Enter your security code"
        intro={`We emailed a 6-digit code to ${email}. Enter it to finish signing in.`}
      />
    );
  }

  return (
    <div className="space-y-5 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
      <div>
        <h2 className="font-display text-3xl text-ink">
          {mode === "signup" ? "Create customer account" : "Customer login"}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          {mode === "signup"
            ? "Create an account with email or Apple. Email accounts require a 6-digit security code."
            : "Sign in with email (password + 6-digit email code) or Apple."}
        </p>
      </div>

      <AppleSignInButton
        label={mode === "signup" ? "Create account with Apple" : "Sign in with Apple"}
        onSuccess={(c) => setCustomer(c)}
        onError={(msg) => setError(msg || null)}
      />

      <div className="flex items-center gap-3 text-xs tracking-[0.16em] text-ink-muted uppercase">
        <span className="h-px flex-1 bg-line" />
        or email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={startEmailAuth} className="space-y-3">
        {mode === "signup" ? (
          <label className="block">
            <span className="text-sm font-medium text-ink">Full name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Password</span>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
          />
        </label>
        {error ? <p className="text-sm text-clay-deep">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep disabled:opacity-60"
        >
          {mode === "signup" ? "Create account & send code" : "Send security code"}
        </button>
      </form>

      <p className="text-sm text-ink-muted">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href={`/login?next=${encodeURIComponent(nextHref)}`} className="font-semibold text-forest hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New renter?{" "}
            <Link href={`/signup?next=${encodeURIComponent(nextHref)}`} className="font-semibold text-forest hover:underline">
              Create account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function SecurityCodeForm({
  email,
  code,
  setCode,
  previewCode,
  error,
  busy,
  onSubmit,
  onCancel,
  title,
  intro,
}: {
  email: string;
  code: string;
  setCode: (v: string) => void;
  previewCode: string | null;
  error: string | null;
  busy: boolean;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  title: string;
  intro: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
      <h2 className="font-display text-3xl text-ink">{title}</h2>
      <p className="text-sm text-ink-muted">{intro}</p>
      {previewCode ? (
        <p className="rounded-lg bg-paper p-3 text-sm text-ink outline outline-1 outline-line">
          Local preview code (email provider not configured):{" "}
          <span className="font-semibold tracking-[0.2em]">{previewCode}</span>
        </p>
      ) : null}
      <label className="block">
        <span className="text-sm font-medium text-ink">6-digit code</span>
        <input
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-center font-display text-2xl tracking-[0.35em] outline outline-1 outline-line"
          placeholder="000000"
          aria-label={`Security code sent to ${email}`}
        />
      </label>
      {error ? <p className="text-sm text-clay-deep">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy || code.length !== 6}
          className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep disabled:opacity-60"
        >
          Verify code
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="rounded-md bg-paper px-5 py-3 text-sm font-semibold text-forest outline outline-1 outline-line"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
