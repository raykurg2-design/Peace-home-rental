"use client";

const KEY = "phr-recent";
const MAX = 8;

export function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function pushRecent(slug: string): void {
  const next = [slug, ...loadRecent().filter((s) => s !== slug)].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
