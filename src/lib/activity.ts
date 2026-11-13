import { randomBytes } from "node:crypto";
import { sql } from "@/lib/db";

export type ActivityEvent = {
  id: string;
  customer_id: string | null;
  actor_role: "customer" | "owner" | "system";
  kind: string;
  title: string;
  detail: string | null;
  created_at: string;
};

export type ActivityPublic = {
  id: string;
  customerId: string | null;
  actorRole: ActivityEvent["actor_role"];
  kind: string;
  title: string;
  detail: string | null;
  createdAt: string;
};

function newId(): string {
  return `act_${randomBytes(12).toString("hex")}`;
}

export function toActivityPublic(row: ActivityEvent): ActivityPublic {
  return {
    id: row.id,
    customerId: row.customer_id,
    actorRole: row.actor_role,
    kind: row.kind,
    title: row.title,
    detail: row.detail,
    createdAt: row.created_at,
  };
}

export async function recordActivity(input: {
  customerId?: string | null;
  actorRole: ActivityEvent["actor_role"];
  kind: string;
  title: string;
  detail?: string | null;
}): Promise<ActivityEvent> {
  const id = newId();
  const rows = await sql<ActivityEvent>(
    `insert into activity_events (id, customer_id, actor_role, kind, title, detail)
     values ($1, $2, $3, $4, $5, $6)
     returning id, customer_id, actor_role, kind, title, detail, created_at`,
    [
      id,
      input.customerId ?? null,
      input.actorRole,
      input.kind,
      input.title,
      input.detail ?? null,
    ],
  );
  return rows[0];
}

export async function listCustomerActivity(customerId: string, limit = 40): Promise<ActivityEvent[]> {
  return sql<ActivityEvent>(
    `select id, customer_id, actor_role, kind, title, detail, created_at
     from activity_events
     where customer_id = $1
     order by created_at desc
     limit $2`,
    [customerId, limit],
  );
}

export async function listOwnerActivity(limit = 60): Promise<ActivityEvent[]> {
  return sql<ActivityEvent>(
    `select id, customer_id, actor_role, kind, title, detail, created_at
     from activity_events
     order by created_at desc
     limit $1`,
    [limit],
  );
}
