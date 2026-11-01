export type SupabaseEnv = {
  url: string;
  key: string;
  configured: boolean;
};

/**
 * Reads only public Supabase credentials. The service-role key is deliberately
 * not part of this module and must never be exposed to the browser.
 */
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";

  return {
    url,
    key,
    configured: Boolean(url && key),
  };
}

export function requireSupabaseEnv(): { url: string; key: string } {
  const env = getSupabaseEnv();

  if (!env.configured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
  }

  return { url: env.url, key: env.key };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv().configured;
}
