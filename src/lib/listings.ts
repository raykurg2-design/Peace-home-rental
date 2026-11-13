import raw from "@/data/listings.json";

export type Listing = {
  slug: string;
  title: string;
  description: string;
  rent: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  city: string;
  state: string;
  zip: string | null;
  street: string;
  images: string[];
  lat: number | null;
  lng: number | null;
  deposit: number;
  applicationFee: number;
  amenities: string[];
  pets: string | null;
  neighborhood: string | null;
};

export const listings = raw as Listing[];

export const OFFICE = {
  name: "Peace Home Rental",
  phone: "+1 407-655-3079",
  phoneHref: "tel:+14076553079",
  email: "contact@peacehomerental.com",
  emailHref: "mailto:contact@peacehomerental.com",
  city: "Tampa",
  state: "FL",
  tagline: "Private homes. Trusted listings. Peace of mind.",
};

export function formatRent(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBedsBaths(listing: Listing): string {
  const parts: string[] = [];
  if (listing.beds != null) parts.push(`${listing.beds} bd`);
  if (listing.baths != null) parts.push(`${listing.baths} ba`);
  if (listing.sqft != null) parts.push(`${listing.sqft.toLocaleString()} sqft`);
  return parts.join(" · ");
}

export function getListing(slug: string): Listing | undefined {
  return listings.find((l) => l.slug === slug);
}

export type Market = {
  key: string;
  city: string;
  state: string;
  count: number;
};

export function getMarkets(): Market[] {
  const map = new Map<string, Market>();
  for (const l of listings) {
    const city = l.city.trim();
    const state = l.state.trim();
    const key = `${city}, ${state}`;
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { key, city, state, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export type SearchFilters = {
  q?: string;
  city?: string;
  beds?: string;
  maxRent?: string;
};

export function searchListings(filters: SearchFilters): Listing[] {
  const q = filters.q?.trim().toLowerCase() ?? "";
  const city = filters.city?.trim().toLowerCase() ?? "";
  const beds = filters.beds ? Number(filters.beds) : null;
  const maxRent = filters.maxRent ? Number(filters.maxRent) : null;

  return listings.filter((l) => {
    if (city && !`${l.city}, ${l.state}`.toLowerCase().includes(city) && !l.city.toLowerCase().includes(city)) {
      return false;
    }
    if (beds != null && !Number.isNaN(beds) && (l.beds ?? 0) < beds) return false;
    if (maxRent != null && !Number.isNaN(maxRent) && l.rent > maxRent) return false;
    if (q) {
      const hay = [l.title, l.street, l.city, l.state, l.zip, l.neighborhood, l.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function featuredListings(limit = 6): Listing[] {
  return [...listings].sort((a, b) => b.rent - a.rent).slice(0, limit);
}

export function relatedListings(listing: Listing, limit = 3): Listing[] {
  return listings
    .filter((l) => l.slug !== listing.slug)
    .map((l) => {
      let score = 0;
      if (l.city === listing.city) score += 3;
      if (l.state === listing.state) score += 1;
      if (l.beds != null && listing.beds != null && l.beds === listing.beds) score += 2;
      const rentDelta = Math.abs(l.rent - listing.rent);
      score += Math.max(0, 2 - rentDelta / 1000);
      return { l, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.l);
}

export function mapsUrl(listing: Listing): string {
  const q = encodeURIComponent(`${listing.street}, ${listing.city}, ${listing.state} ${listing.zip ?? ""}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function stats() {
  const rents = listings.map((l) => l.rent);
  return {
    homes: listings.length,
    markets: getMarkets().length,
    from: Math.min(...rents),
  };
}
