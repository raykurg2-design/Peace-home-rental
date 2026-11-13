"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { OFFICE } from "@/lib/listings";

const links = [
  { href: "/properties", label: "Homes" },
  { href: "/favorites", label: "Saved" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "/account", label: "Account" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onDark = overlay && !open;

  return (
    <header
      className={`relative z-40 ${
        overlay
          ? "absolute inset-x-0 top-0"
          : "sticky top-0 border-b border-line/70 bg-paper/90 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/brand/logo.jpg"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full object-cover outline outline-1 outline-black/10"
            priority
          />
          <span
            className={`font-display text-xl tracking-tight sm:text-2xl ${
              onDark ? "text-paper" : "text-forest"
            }`}
          >
            {OFFICE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  onDark
                    ? active
                      ? "text-paper"
                      : "text-paper/75 hover:text-paper"
                    : active
                      ? "text-forest"
                      : "text-ink-muted hover:text-forest"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/properties"
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              onDark
                ? "bg-paper text-forest hover:bg-surface"
                : "bg-forest text-paper hover:bg-forest-deep"
            }`}
          >
            Browse homes
          </Link>
        </nav>

        <button
          type="button"
          className={`grid size-10 place-items-center rounded-md md:hidden ${
            onDark ? "text-paper" : "text-forest"
          }`}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-base font-medium text-forest"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/properties"
              className="mt-2 rounded-md bg-forest px-4 py-3 text-center text-sm font-semibold text-paper"
              onClick={() => setOpen(false)}
            >
              Browse homes
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
