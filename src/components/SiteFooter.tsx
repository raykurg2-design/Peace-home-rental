import Link from "next/link";
import { OFFICE } from "@/lib/listings";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-forest-deep text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl">{OFFICE.name}</p>
          <p className="mt-3 max-w-sm text-sm text-paper/75">{OFFICE.tagline}</p>
          <p className="mt-5 text-sm text-paper/70">
            Office in {OFFICE.city}, {OFFICE.state}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-paper/55 uppercase">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-paper/85">
            <li>
              <Link href="/properties" className="hover:text-paper">
                Homes for rent
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-paper">
                How renting works
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-paper">
                About the office
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-paper">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/rental-policies" className="hover:text-paper">
                Rental policies
              </Link>
            </li>
            <li>
              <Link href="/favorites" className="hover:text-paper">
                Saved homes
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-paper">
                Renter account
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-paper">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-paper/55 uppercase">Reach us</p>
          <ul className="mt-4 space-y-2 text-sm text-paper/85">
            <li>
              <a href={OFFICE.phoneHref} className="hover:text-paper">
                {OFFICE.phone}
              </a>
            </li>
            <li>
              <a href={OFFICE.emailHref} className="hover:text-paper">
                {OFFICE.email}
              </a>
            </li>
          </ul>
          <p className="mt-6 text-xs text-paper/55">Equal Housing Opportunity</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-paper/50 sm:px-6">
          <p>
            © {new Date().getFullYear()} {OFFICE.name}. Homes managed with care.
          </p>
          <Link href="/owner" className="text-paper/40 hover:text-paper/70">
            Owner workspace
          </Link>
        </div>
      </div>
    </footer>
  );
}
