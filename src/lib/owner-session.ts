"use client";

export const OWNER_SESSION_KEY = "phr-owner-session";
/** Sample access code for local/demo unlock. Replace when wiring real auth. */
export const OWNER_ACCESS_CODE = "peace-owner";

export function isOwnerUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(OWNER_SESSION_KEY) === "1";
}

export function unlockOwner(code: string): boolean {
  if (code.trim() !== OWNER_ACCESS_CODE) return false;
  window.localStorage.setItem(OWNER_SESSION_KEY, "1");
  return true;
}

export function lockOwner(): void {
  window.localStorage.removeItem(OWNER_SESSION_KEY);
}
