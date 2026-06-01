import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service-role key. All inventory/lead
 * access in the app runs server-side, so this is the single data client. The
 * service-role key must never be exposed to the browser.
 *
 * Created lazily so the app still boots in mock mode without Supabase env vars.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is selected (DATA_SOURCE=supabase) but NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set.",
    );
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
