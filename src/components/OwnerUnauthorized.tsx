import Image from "next/image";
import Link from "next/link";
import { OFFICE } from "@/lib/listings";

export function OwnerUnauthorized() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8 outline outline-1 outline-line shadow-[var(--shadow-soft)]">
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
            <p className="text-xs tracking-[0.16em] text-ink-muted uppercase">Owner workspace</p>
          </div>
        </div>
        <h1 className="mt-6 font-display text-3xl text-ink">Sign in required</h1>
        <p className="mt-3 text-sm text-ink-muted">
          Owner tools are only available when you are signed in through Cursor. Publish this app as{" "}
          <strong>private</strong> or <strong>team</strong> so Cursor can verify who is opening it. Renters never see
          this area from the customer site.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-forest hover:underline">
          ← Back to customer site
        </Link>
      </div>
    </div>
  );
}
