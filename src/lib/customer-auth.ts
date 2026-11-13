import { createHash, randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";

const scrypt = promisify(scryptCb);
export const SESSION_COOKIE = "phr_customer_session";
const SESSION_DAYS = 30;
const OTP_TTL_MS = 1000 * 60 * 10;
const OTP_MAX_ATTEMPTS = 5;

export type Customer = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  email_verified_at: string | null;
  profile_verified_at: string | null;
  policies_accepted_at: string | null;
  created_at: string;
  apple_sub?: string | null;
  auth_provider?: string | null;
  password_hash?: string | null;
};

export type CustomerPublic = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  emailVerified: boolean;
  customerVerified: boolean;
  authProvider: string;
};

function newId(prefix: string): string {
  return `${prefix}_${randomBytes(16).toString("hex")}`;
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function toPublic(c: Customer): CustomerPublic {
  return {
    id: c.id,
    email: c.email,
    name: c.name,
    phone: c.phone,
    emailVerified: Boolean(c.email_verified_at),
    customerVerified: Boolean(c.profile_verified_at && c.email_verified_at && c.policies_accepted_at),
    authProvider: c.auth_provider || "email",
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

export async function createCustomer(input: {
  email: string;
  password: string;
  name: string;
}): Promise<Customer> {
  const id = newId("cus");
  const passwordHash = await hashPassword(input.password);
  const rows = await sql<Customer>(
    `insert into customers (id, email, password_hash, name, auth_provider)
     values ($1, $2, $3, $4, 'email')
     returning id, email, name, phone, email_verified_at, profile_verified_at, policies_accepted_at, created_at, apple_sub, auth_provider`,
    [id, input.email.toLowerCase().trim(), passwordHash, input.name.trim()],
  );
  return rows[0];
}

export async function createAppleCustomer(input: {
  email: string;
  name: string;
  appleSub: string;
}): Promise<Customer> {
  const id = newId("cus");
  const rows = await sql<Customer>(
    `insert into customers (id, email, password_hash, name, apple_sub, auth_provider, email_verified_at)
     values ($1, $2, null, $3, $4, 'apple', now())
     returning id, email, name, phone, email_verified_at, profile_verified_at, policies_accepted_at, created_at, apple_sub, auth_provider`,
    [id, input.email.toLowerCase().trim(), input.name.trim(), input.appleSub],
  );
  return rows[0];
}

export async function findCustomerByEmail(
  email: string,
): Promise<(Customer & { password_hash: string | null }) | null> {
  const rows = await sql<Customer & { password_hash: string | null }>(
    `select id, email, name, phone, password_hash, email_verified_at, profile_verified_at, policies_accepted_at, created_at, apple_sub, auth_provider
     from customers where email = $1`,
    [email.toLowerCase().trim()],
  );
  return rows[0] ?? null;
}

export async function findCustomerByAppleSub(appleSub: string): Promise<Customer | null> {
  const rows = await sql<Customer>(
    `select id, email, name, phone, email_verified_at, profile_verified_at, policies_accepted_at, created_at, apple_sub, auth_provider
     from customers where apple_sub = $1`,
    [appleSub],
  );
  return rows[0] ?? null;
}

export async function findCustomerById(id: string): Promise<Customer | null> {
  const rows = await sql<Customer>(
    `select id, email, name, phone, email_verified_at, profile_verified_at, policies_accepted_at, created_at, apple_sub, auth_provider
     from customers where id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function linkAppleSub(customerId: string, appleSub: string): Promise<Customer | null> {
  await sql(
    `update customers
     set apple_sub = $2,
         auth_provider = case when auth_provider = 'email' then 'email' else auth_provider end,
         email_verified_at = coalesce(email_verified_at, now())
     where id = $1`,
    [customerId, appleSub],
  );
  return findCustomerById(customerId);
}

export async function createEmailToken(customerId: string, purpose: "email_verify"): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
  await sql(
    `insert into email_tokens (token, customer_id, purpose, expires_at) values ($1, $2, $3, $4)`,
    [token, customerId, purpose, expires],
  );
  return token;
}

export async function consumeEmailToken(
  token: string,
  purpose: "email_verify",
): Promise<Customer | null> {
  const rows = await sql<{ customer_id: string; expires_at: string; used_at: string | null }>(
    `select customer_id, expires_at, used_at from email_tokens where token = $1 and purpose = $2`,
    [token, purpose],
  );
  const row = rows[0];
  if (!row || row.used_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  await sql(`update email_tokens set used_at = now() where token = $1`, [token]);
  await sql(`update customers set email_verified_at = coalesce(email_verified_at, now()) where id = $1`, [
    row.customer_id,
  ]);
  return findCustomerById(row.customer_id);
}

export async function createLoginChallenge(
  customerId: string,
  purpose: "login" | "signup",
): Promise<{ challengeId: string; code: string }> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const id = newId("chg");
  const expires = new Date(Date.now() + OTP_TTL_MS).toISOString();
  await sql(
    `insert into login_challenges (id, customer_id, purpose, code_hash, expires_at)
     values ($1, $2, $3, $4, $5)`,
    [id, customerId, purpose, hashCode(code), expires],
  );
  return { challengeId: id, code };
}

export async function consumeLoginChallenge(
  challengeId: string,
  code: string,
  purpose: "login" | "signup",
): Promise<Customer | null> {
  const rows = await sql<{
    customer_id: string;
    code_hash: string;
    expires_at: string;
    used_at: string | null;
    attempts: number;
  }>(
    `select customer_id, code_hash, expires_at, used_at, attempts
     from login_challenges where id = $1 and purpose = $2`,
    [challengeId, purpose],
  );
  const row = rows[0];
  if (!row || row.used_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  if (row.attempts >= OTP_MAX_ATTEMPTS) return null;

  const provided = Buffer.from(hashCode(code), "hex");
  const expected = Buffer.from(row.code_hash, "hex");
  const ok = provided.length === expected.length && timingSafeEqual(provided, expected);
  if (!ok) {
    await sql(`update login_challenges set attempts = attempts + 1 where id = $1`, [challengeId]);
    return null;
  }

  await sql(`update login_challenges set used_at = now() where id = $1`, [challengeId]);
  if (purpose === "signup") {
    await sql(`update customers set email_verified_at = coalesce(email_verified_at, now()) where id = $1`, [
      row.customer_id,
    ]);
  }
  return findCustomerById(row.customer_id);
}

export async function createSession(customerId: string): Promise<string> {
  const id = newId("ses");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * SESSION_DAYS).toISOString();
  await sql(`insert into customer_sessions (id, customer_id, expires_at) values ($1, $2, $3)`, [
    id,
    customerId,
    expires,
  ]);
  return id;
}

export async function destroySession(sessionId: string): Promise<void> {
  await sql(`delete from customer_sessions where id = $1`, [sessionId]);
}

export async function getCustomerFromSession(sessionId: string | undefined): Promise<Customer | null> {
  if (!sessionId) return null;
  const rows = await sql<{ customer_id: string; expires_at: string }>(
    `select customer_id, expires_at from customer_sessions where id = $1`,
    [sessionId],
  );
  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await destroySession(sessionId);
    return null;
  }
  return findCustomerById(row.customer_id);
}

export async function getCurrentCustomer(): Promise<Customer | null> {
  const jar = await cookies();
  return getCustomerFromSession(jar.get(SESSION_COOKIE)?.value);
}

export async function completeCustomerVerification(input: {
  customerId: string;
  phone: string;
}): Promise<Customer | null> {
  const phone = input.phone.trim();
  if (phone.length < 7) return null;
  await sql(
    `update customers
     set phone = $2,
         policies_accepted_at = coalesce(policies_accepted_at, now()),
         profile_verified_at = case
           when email_verified_at is not null then coalesce(profile_verified_at, now())
           else profile_verified_at
         end
     where id = $1`,
    [input.customerId, phone],
  );
  return findCustomerById(input.customerId);
}

export function sessionCookieOptions(maxAge = 60 * 60 * 24 * SESSION_DAYS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/** Opaque fingerprint for rate-ish checks without storing IPs in plain form. */
export function requestFingerprint(headers: Headers): string {
  const ua = headers.get("user-agent") ?? "";
  return createHash("sha256").update(ua).digest("hex").slice(0, 24);
}

export function appleClientId(): string {
  return process.env.APPLE_CLIENT_ID?.trim() ?? "";
}
