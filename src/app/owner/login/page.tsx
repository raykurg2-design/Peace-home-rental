"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { OWNER_ACCESS_CODE, isOwnerUnlocked, unlockOwner } from "@/lib/owner-session";
import { OFFICE } from "@/lib/listings";

function OwnerLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/owner";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOwnerUnlocked()) {
      router.replace(next.startsWith("/owner") ? next : "/owner");
    }
  }, [next, router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!unlockOwner(code)) {
      setError("That access code is not valid.");
      return;
    }
    router.replace(next.startsWith("/owner") ? next : "/owner");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl bg-surface p-8 outline outline-1 outline-line shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/logo.jpg"
            alt=""
            width={44}
            height={44}
            className="size-11 rounded-full object-cover outline outline-1 outline-black/10"
          />
          <div>
            <p className="font-display text-2xl text-forest">{OFFICE.name}</p>
            <p className="text-xs tracking-[0.16em] text-ink-muted uppercase">Owner sign-in</p>
          </div>
        </div>
        <p className="mt-5 text-sm text-ink-muted">
          This workspace is separate from the customer site. Renters never see these tools.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink">Owner access code</span>
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2.5 text-sm outline outline-1 outline-line"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="text-sm text-clay-deep">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-md bg-forest px-4 py-3 text-sm font-semibold text-paper hover:bg-forest-deep"
          >
            Enter owner workspace
          </button>
        </form>
        <p className="mt-4 text-xs text-ink-muted">
          Demo code: <code className="rounded bg-paper px-1.5 py-0.5 outline outline-1 outline-line">{OWNER_ACCESS_CODE}</code>
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-forest hover:underline">
          ← Back to customer site
        </Link>
      </div>
    </div>
  );
}

export default function OwnerLoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-ink-muted">Loading…</div>}>
      <OwnerLoginForm />
    </Suspense>
  );
}
