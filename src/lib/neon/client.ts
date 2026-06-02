import { Pool } from "@neondatabase/serverless";

let _pool: Pool | null = null;

/**
 * Returns a shared Neon connection pool.
 * Created lazily so the app still boots in mock mode without DATABASE_URL.
 */
export function getNeonPool(): Pool {
  if (_pool) return _pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Neon is selected (DATA_SOURCE=neon) but DATABASE_URL is not set.",
    );
  }
  _pool = new Pool({ connectionString: url });
  return _pool;
}
