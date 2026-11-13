"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { isOwnerUnlocked, lockOwner } from "@/lib/owner-session";
import { OFFICE } from "@/lib/listings";

const links = [
  { href: "/owner", label: "Overview", exact: true },
  { href: "/owner/listings", label: "Listings" },
  { href: "/owner/inquiries", label: "Inquiries" },
  { href: "/owner/listings/new", label: "Add listing" },
];

export function OwnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const ok = isOwnerUnlocked();
    setAllowed(ok);
    setReady(true);
    if (!ok && pathname !== "/owner/login") {
      router.replace(`/owner/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  function signOut() {
    lockOwner();
    router.push("/owner/login");
  }

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-forest-deep text-paper/70">
        Loading owner workspace…
      </div>
    );
  }

  if (!allowed && pathname !== "/owner/login") {
    return (
      <div className="grid min-h-screen place-items-center bg-forest-deep text-paper/70">
        Redirecting to owner sign-in…
      </div>
    );
  }

  if (pathname === "/owner/login") {
    return <div className="min-h-screen bg-paper">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#eef2ef]">
      <header className="sticky top-0 z-40 border-b border-forest/15 bg-forest-deep text-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/owner" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <Image
              src="/brand/logo.jpg"
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-full object-cover outline outline-1 outline-white/20"
            />
            <div>
              <p className="font-display text-lg leading-none sm:text-xl">{OFFICE.name}</p>
              <p className="mt-1 text-[11px] tracking-[0.16em] text-paper/55 uppercase">Owner workspace</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium ${active ? "text-paper" : "text-paper/65 hover:text-paper"}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/" className="text-sm text-paper/55 hover:text-paper">
              Customer site
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="rounded-md bg-paper/10 px-3 py-1.5 text-sm text-paper hover:bg-paper/15"
            >
              Sign out
            </button>
          </nav>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-md text-paper md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-white/10 px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-1 text-base text-paper"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/" className="py-1 text-base text-paper/70" onClick={() => setOpen(false)}>
                Customer site
              </Link>
              <button type="button" onClick={signOut} className="py-1 text-left text-base text-paper/70">
                Sign out
              </button>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
