import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
let pool: pg.Pool | undefined;
let local: Promise<PGlite> | undefined;

/** Match scripts/migrate.mjs: strip sslmode so pg does not force strict cert checks. */
function poolConfig(connectionUrl: string): pg.PoolConfig {
  let parsed: URL;
  try {
    parsed = new URL(connectionUrl);
  } catch {
    return {
      connectionString: connectionUrl,
      max: 5,
      ssl: { rejectUnauthorized: false },
    };
  }

  const host = parsed.hostname;
  const localHost = host === "localhost" || host === "127.0.0.1" || host === "::1";
  const mode = (parsed.searchParams.get("sslmode") || "").toLowerCase();
  const wantsSsl =
    mode === "require" ||
    mode === "verify-ca" ||
    mode === "verify-full" ||
    mode === "prefer" ||
    (!localHost && mode !== "disable");

  parsed.searchParams.delete("sslmode");
  parsed.searchParams.delete("ssl");

  return {
    connectionString: parsed.toString(),
    max: 5,
    ssl: wantsSsl ? { rejectUnauthorized: false } : false,
  };
}

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool(poolConfig(databaseUrl));
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
