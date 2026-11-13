import { readdir, readFile } from "node:fs/promises";
import pg from "pg";

const url = process.env.DATABASE_URL?.trim() ?? "";
const files = (await readdir("migrations").catch(() => []))
  .filter((f) => f.endsWith(".sql"))
  .sort();
if (url === "" || files.length === 0) {
  console.log("migrate: nothing to do");
  process.exit(0);
}

const rawConnectionString = process.env.DATABASE_URL_UNPOOLED?.trim() || url;

/**
 * pg's URL parser turns sslmode=require into ssl:true (strict certs).
 * Strip sslmode and set ssl ourselves so hosted DBs with custom CAs work.
 */
function connectionOptions(connectionUrl) {
  let parsed;
  try {
    parsed = new URL(connectionUrl);
  } catch {
    return {
      connectionString: connectionUrl,
      ssl: { rejectUnauthorized: false },
    };
  }

  const host = parsed.hostname;
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";
  const mode = (parsed.searchParams.get("sslmode") || "").toLowerCase();
  const wantsSsl =
    mode === "require" ||
    mode === "verify-ca" ||
    mode === "verify-full" ||
    mode === "prefer" ||
    (!local && mode !== "disable");

  parsed.searchParams.delete("sslmode");
  parsed.searchParams.delete("ssl");

  return {
    connectionString: parsed.toString(),
    ssl: wantsSsl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 15_000,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(maxAttempts = 6) {
  const options = connectionOptions(rawConnectionString);
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const client = new pg.Client(options);
    try {
      await client.connect();
      if (attempt > 1) console.log(`migrate: connected on attempt ${attempt}`);
      return client;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`migrate: connect attempt ${attempt}/${maxAttempts} failed: ${message}`);
      try {
        await client.end();
      } catch {
        /* ignore */
      }
      if (attempt < maxAttempts) {
        await sleep(Math.min(8_000, 500 * 2 ** (attempt - 1)));
      }
    }
  }
  throw lastError;
}

const client = await connectWithRetry();
let locked = false;
try {
  await client.query("set lock_timeout = '60s'");
  try {
    await client.query("select pg_advisory_lock(7272741)");
    locked = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`migrate: advisory lock unavailable, continuing: ${message}`);
  }
  await client.query(
    "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  const done = new Set(
    (await client.query("select name from schema_migrations")).rows.map((r) => r.name),
  );
  for (const file of files.filter((f) => !done.has(f))) {
    await client.query("begin");
    try {
      await client.query(await readFile(`migrations/${file}`, "utf8"));
      await client.query("insert into schema_migrations (name) values ($1)", [file]);
      await client.query("commit");
      console.log(`migrate: applied ${file}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }
  console.log("migrate: up to date");
} finally {
  if (locked) {
    try {
      await client.query("select pg_advisory_unlock(7272741)");
    } catch {
      /* ignore */
    }
  }
  await client.end();
}
