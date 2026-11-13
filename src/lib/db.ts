import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
let pool: pg.Pool | undefined;
let local: Promise<PGlite> | undefined;

function poolSslOption(connectionUrl: string): false | { rejectUnauthorized: false } {
  try {
    const parsed = new URL(connectionUrl);
    const host = parsed.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") return false;
    const mode = (parsed.searchParams.get("sslmode") || "").toLowerCase();
    if (mode === "disable") return false;
    return { rejectUnauthorized: false };
  } catch {
    return { rejectUnauthorized: false };
  }
}

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({
      connectionString: databaseUrl,
      max: 5,
      ssl: poolSslOption(databaseUrl),
    });
    return (await pool.query(text, params)).rows as T[];
  }
  local ??= startLocal().catch((error: unknown) => {
    local = undefined;
    throw error;
  });
  return (await (await local).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const db = new PGlite();
  const files = (await readdir("migrations").catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  }
  return db;
}
