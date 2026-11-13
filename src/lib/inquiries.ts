import { randomBytes } from "node:crypto";
import { sql } from "@/lib/db";
import type { InquiryKind, InquiryStatus } from "@/lib/rental-types";

export type { InquiryKind, InquiryStatus };

export type InquiryRow = {
  id: string;
  customer_id: string;
  listing_slug: string;
  listing_title: string;
  kind: InquiryKind;
  message: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string | null;
};

export type InquiryPublic = {
  id: string;
  customerId: string;
  listingSlug: string;
  listingTitle: string;
  kind: InquiryKind;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string | null;
};

function newId(): string {
  return `inq_${randomBytes(12).toString("hex")}`;
}

export function toInquiryPublic(row: InquiryRow): InquiryPublic {
  return {
    id: row.id,
    customerId: row.customer_id,
    listingSlug: row.listing_slug,
    listingTitle: row.listing_title,
    kind: row.kind,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
  };
}

export async function createInquiry(input: {
  customerId: string;
  listingSlug: string;
  listingTitle: string;
  kind: InquiryKind;
  message: string;
}): Promise<InquiryRow> {
  const id = newId();
  const rows = await sql<InquiryRow>(
    `insert into inquiries (id, customer_id, listing_slug, listing_title, kind, message)
     values ($1, $2, $3, $4, $5, $6)
     returning id, customer_id, listing_slug, listing_title, kind, message, status, created_at, updated_at`,
    [
      id,
      input.customerId,
      input.listingSlug,
      input.listingTitle,
      input.kind,
      input.message.trim(),
    ],
  );
  return rows[0];
}

export async function listCustomerInquiries(customerId: string): Promise<InquiryRow[]> {
  return sql<InquiryRow>(
    `select id, customer_id, listing_slug, listing_title, kind, message, status, created_at, updated_at
     from inquiries where customer_id = $1
     order by created_at desc`,
    [customerId],
  );
}

export async function listAllInquiries(): Promise<InquiryRow[]> {
  return sql<InquiryRow>(
    `select i.id, i.customer_id, i.listing_slug, i.listing_title, i.kind, i.message, i.status,
            i.created_at, i.updated_at, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
     from inquiries i
     join customers c on c.id = i.customer_id
     order by i.created_at desc`,
  );
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
): Promise<InquiryRow | null> {
  const rows = await sql<InquiryRow>(
    `update inquiries set status = $2, updated_at = now()
     where id = $1
     returning id, customer_id, listing_slug, listing_title, kind, message, status, created_at, updated_at`,
    [id, status],
  );
  return rows[0] ?? null;
}

export async function findInquiry(id: string): Promise<InquiryRow | null> {
  const rows = await sql<InquiryRow>(
    `select id, customer_id, listing_slug, listing_title, kind, message, status, created_at, updated_at
     from inquiries where id = $1`,
    [id],
  );
  return rows[0] ?? null;
}
