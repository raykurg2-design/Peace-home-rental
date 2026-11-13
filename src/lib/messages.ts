import { randomBytes } from "node:crypto";
import { sql } from "@/lib/db";

export type SenderRole = "customer" | "owner";

export type ThreadRow = {
  id: string;
  customer_id: string;
  listing_slug: string | null;
  listing_title: string | null;
  subject: string;
  inquiry_id: string | null;
  last_message_at: string;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
};

export type MessageRow = {
  id: string;
  thread_id: string;
  sender_role: SenderRole;
  sender_name: string;
  body: string;
  created_at: string;
};

export type ThreadPublic = {
  id: string;
  customerId: string;
  listingSlug: string | null;
  listingTitle: string | null;
  subject: string;
  inquiryId: string | null;
  lastMessageAt: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  preview?: string | null;
};

export type MessagePublic = {
  id: string;
  threadId: string;
  senderRole: SenderRole;
  senderName: string;
  body: string;
  createdAt: string;
};

function newId(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}

export function toThreadPublic(row: ThreadRow & { preview?: string | null }): ThreadPublic {
  return {
    id: row.id,
    customerId: row.customer_id,
    listingSlug: row.listing_slug,
    listingTitle: row.listing_title,
    subject: row.subject,
    inquiryId: row.inquiry_id,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    preview: row.preview,
  };
}

export function toMessagePublic(row: MessageRow): MessagePublic {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderRole: row.sender_role,
    senderName: row.sender_name,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function createThreadWithMessage(input: {
  customerId: string;
  listingSlug?: string | null;
  listingTitle?: string | null;
  subject: string;
  inquiryId?: string | null;
  senderRole: SenderRole;
  senderName: string;
  body: string;
}): Promise<{ thread: ThreadRow; message: MessageRow }> {
  const threadId = newId("thr");
  const messageId = newId("msg");
  const threads = await sql<ThreadRow>(
    `insert into message_threads (id, customer_id, listing_slug, listing_title, subject, inquiry_id)
     values ($1, $2, $3, $4, $5, $6)
     returning id, customer_id, listing_slug, listing_title, subject, inquiry_id, last_message_at, created_at`,
    [
      threadId,
      input.customerId,
      input.listingSlug ?? null,
      input.listingTitle ?? null,
      input.subject.trim(),
      input.inquiryId ?? null,
    ],
  );
  const messages = await sql<MessageRow>(
    `insert into messages (id, thread_id, sender_role, sender_name, body)
     values ($1, $2, $3, $4, $5)
     returning id, thread_id, sender_role, sender_name, body, created_at`,
    [messageId, threadId, input.senderRole, input.senderName, input.body.trim()],
  );
  return { thread: threads[0], message: messages[0] };
}

export async function addMessage(input: {
  threadId: string;
  senderRole: SenderRole;
  senderName: string;
  body: string;
}): Promise<MessageRow> {
  const id = newId("msg");
  const rows = await sql<MessageRow>(
    `insert into messages (id, thread_id, sender_role, sender_name, body)
     values ($1, $2, $3, $4, $5)
     returning id, thread_id, sender_role, sender_name, body, created_at`,
    [id, input.threadId, input.senderRole, input.senderName, input.body.trim()],
  );
  await sql(`update message_threads set last_message_at = now() where id = $1`, [input.threadId]);
  return rows[0];
}

export async function findThread(id: string): Promise<ThreadRow | null> {
  const rows = await sql<ThreadRow>(
    `select t.id, t.customer_id, t.listing_slug, t.listing_title, t.subject, t.inquiry_id,
            t.last_message_at, t.created_at, c.name as customer_name, c.email as customer_email
     from message_threads t
     join customers c on c.id = t.customer_id
     where t.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function listCustomerThreads(customerId: string): Promise<(ThreadRow & { preview: string | null })[]> {
  return sql<ThreadRow & { preview: string | null }>(
    `select t.id, t.customer_id, t.listing_slug, t.listing_title, t.subject, t.inquiry_id,
            t.last_message_at, t.created_at,
            (select m.body from messages m where m.thread_id = t.id order by m.created_at desc limit 1) as preview
     from message_threads t
     where t.customer_id = $1
     order by t.last_message_at desc`,
    [customerId],
  );
}

export async function listAllThreads(): Promise<(ThreadRow & { preview: string | null })[]> {
  return sql<ThreadRow & { preview: string | null }>(
    `select t.id, t.customer_id, t.listing_slug, t.listing_title, t.subject, t.inquiry_id,
            t.last_message_at, t.created_at, c.name as customer_name, c.email as customer_email,
            (select m.body from messages m where m.thread_id = t.id order by m.created_at desc limit 1) as preview
     from message_threads t
     join customers c on c.id = t.customer_id
     order by t.last_message_at desc`,
  );
}

export async function listMessages(threadId: string): Promise<MessageRow[]> {
  return sql<MessageRow>(
    `select id, thread_id, sender_role, sender_name, body, created_at
     from messages where thread_id = $1
     order by created_at asc`,
    [threadId],
  );
}
