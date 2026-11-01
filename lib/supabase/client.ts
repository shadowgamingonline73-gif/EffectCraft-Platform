import { createBrowserClient } from "@supabase/ssr";

import { requireSupabaseEnv } from "@/lib/supabase/config";

/**
 * Browser-side Supabase client.
 *
 * Only public environment variables are used here. Never import the service
 * role key into this module.
 */
export function createClient() {
  const { url, key } = requireSupabaseEnv();
  return createBrowserClient(url, key);
}
