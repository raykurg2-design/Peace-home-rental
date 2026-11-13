"use client";

const KEY = "phr-favorites";

export function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(slugs: string[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(slugs));
}

export function toggleFavorite(slug: string): string[] {
  const current = loadFavorites();
  const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
  saveFavorites(next);
  return next;
}

export function isFavorite(slug: string): boolean {
  return loadFavorites().includes(slug);
}
