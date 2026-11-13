"use client";

import { listings as seedListings, type Listing } from "@/lib/listings";

export type ListingStatus = "available" | "pending" | "rented" | "draft";

export type OwnerListing = Listing & {
  status: ListingStatus;
};

export type InquiryStatus = "pending" | "contacted" | "closed";

export type Inquiry = {
  id: string;
  listingSlug: string;
  listingTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
};

const LISTINGS_KEY = "phr-owner-listings";
const INQUIRIES_KEY = "phr-owner-inquiries";

function seedOwnerListings(): OwnerListing[] {
  return seedListings.map((l) => ({ ...l, status: "available" as const }));
}

export function loadOwnerListings(): OwnerListing[] {
  if (typeof window === "undefined") return seedOwnerListings();
  try {
    const raw = window.localStorage.getItem(LISTINGS_KEY);
    if (!raw) {
      const seeded = seedOwnerListings();
      window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as OwnerListing[];
  } catch {
    return seedOwnerListings();
  }
}

export function saveOwnerListings(next: OwnerListing[]): void {
  window.localStorage.setItem(LISTINGS_KEY, JSON.stringify(next));
}

export function upsertOwnerListing(listing: OwnerListing): OwnerListing[] {
  const all = loadOwnerListings();
  const idx = all.findIndex((l) => l.slug === listing.slug);
  if (idx >= 0) all[idx] = listing;
  else all.unshift(listing);
  saveOwnerListings(all);
  return all;
}

export function setListingStatus(slug: string, status: ListingStatus): OwnerListing[] {
  const all = loadOwnerListings().map((l) => (l.slug === slug ? { ...l, status } : l));
  saveOwnerListings(all);
  return all;
}

export function loadInquiries(): Inquiry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INQUIRIES_KEY);
    return raw ? (JSON.parse(raw) as Inquiry[]) : [];
  } catch {
    return [];
  }
}

export function saveInquiries(next: Inquiry[]): void {
  window.localStorage.setItem(INQUIRIES_KEY, JSON.stringify(next));
}

export function addInquiry(input: Omit<Inquiry, "id" | "createdAt" | "status">): Inquiry {
  const inquiry: Inquiry = {
    ...input,
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const all = [inquiry, ...loadInquiries()];
  saveInquiries(all);
  return inquiry;
}

export function setInquiryStatus(id: string, status: InquiryStatus): Inquiry[] {
  const all = loadInquiries().map((i) => (i.id === id ? { ...i, status } : i));
  saveInquiries(all);
  return all;
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function statusLabel(status: ListingStatus | InquiryStatus): string {
  switch (status) {
    case "available":
      return "Available";
    case "pending":
      return "Pending";
    case "rented":
      return "Rented";
    case "draft":
      return "Draft";
    case "contacted":
      return "Contacted";
    case "closed":
      return "Closed";
    default:
      return status;
  }
}
