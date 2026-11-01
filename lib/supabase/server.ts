import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requireSupabaseEnv } from "@/lib/supabase/config";

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers. Session cookies are read from and written to Next.js'
 * request cookie store.
 */
export async function createClient() {
  const { url, key } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. The root middleware
          // refreshes the session so this is safe to ignore there.
        }
      },
    },
  });
}
