"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { fetchCustomer, type CustomerPublic } from "@/lib/customer-client";

type Mode = "signup" | "login";

export function AccountPanel({
  nextHref = "/account",
}: {
  nextHref?: string;
}) {
  const [customer, setCustomer] = useState<CustomerPublic | null | undefined>(undefined);
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptPolicies, setAcceptPolicies] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  async function onAuth(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setPreviewUrl(null);
    try {
      const path = mode === "signup" ? "/api/customer/signup" : "/api/customer/login";
      const res = await fetch(path, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup" ? { name, email, password } : { email, password },
        ),
      });
      const data = (await res.json()) as {
        error?: string;
        customer?: CustomerPublic;
        email?: { sent?: boolean; previewUrl?: string | null };
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      if (data.customer) setCustomer(data.customer);
      if (data.email?.previewUrl) setPreviewUrl(data.email.previewUrl);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/customer/resend-verification", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await res.json()) as {
        error?: string;
        email?: { previewUrl?: string | null };
      };
      if (!res.ok) {
        setError(data.error ?? "Could not resend.");
        return;
      }
      setPreviewUrl(data.email?.previewUrl ?? null);
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
    setBusy(false);
  }

  if (customer === undefined) {
    return (
      <div className="rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <p className="text-sm text-ink-muted">Loading account…</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-4 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <h2 className="font-display text-3xl text-ink">
          {mode === "signup" ? "Create your renter account" : "Sign in"}
        </h2>
        <p className="text-sm text-ink-muted">
          Verified customers can request tours and start applications. Owner tools stay at{" "}
          <Link href="/owner" className="font-medium text-forest hover:underline">
            /owner
          </Link>
          .
        </p>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            className={mode === "signup" ? "font-semibold text-forest" : "text-ink-muted"}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
          <span className="text-line">·</span>
          <button
            type="button"
            className={mode === "login" ? "font-semibold text-forest" : "text-ink-muted"}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
        </div>
        <form onSubmit={onAuth} className="space-y-3">
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
            className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep disabled:opacity-60"
          >
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  if (!customer.emailVerified) {
    return (
      <div className="space-y-4 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
        <h2 className="font-display text-3xl text-ink">Verify your email</h2>
        <p className="text-sm text-ink-muted">
          We sent a link to <strong className="text-ink">{customer.email}</strong>. Open it to confirm
          this address before requesting tours or applying.
        </p>
        {previewUrl ? (
          <p className="rounded-lg bg-paper p-3 text-sm text-ink outline outline-1 outline-line">
            Local preview (no email provider configured):{" "}
            <a href={previewUrl} className="font-semibold text-forest hover:underline">
              Open verification link
            </a>
          </p>
        ) : null}
        {error ? <p className="text-sm text-clay-deep">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={resend}
            className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep disabled:opacity-60"
          >
            Resend email
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
      </div>
    );
  }

  if (!customer.customerVerified) {
    return (
      <form
        onSubmit={completeVerification}
        className="space-y-4 rounded-2xl bg-surface p-6 outline outline-1 outline-line"
      >
        <h2 className="font-display text-3xl text-ink">Complete customer verification</h2>
        <p className="text-sm text-ink-muted">
          Email confirmed for {customer.name}. Add a phone number and accept rental policies to unlock
          tours and applications.
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

  return (
    <div className="space-y-4 rounded-2xl bg-surface p-6 outline outline-1 outline-line">
      <h2 className="font-display text-3xl text-ink">You&apos;re verified</h2>
      <p className="text-sm text-ink-muted">
        {customer.name} · {customer.email}
        {customer.phone ? ` · ${customer.phone}` : ""}
      </p>
      <p className="text-sm text-ink">
        Email and customer verification are complete. You can request tours and start applications.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={nextHref}
          className="rounded-md bg-forest px-5 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
        >
          Continue
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
