"use client";

export type CustomerPublic = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  emailVerified: boolean;
  customerVerified: boolean;
  authProvider?: string;
};

export async function fetchCustomer(): Promise<CustomerPublic | null> {
  const res = await fetch("/api/customer/me", { credentials: "same-origin" });
  if (!res.ok) return null;
  const data = (await res.json()) as { customer: CustomerPublic | null };
  return data.customer;
}
