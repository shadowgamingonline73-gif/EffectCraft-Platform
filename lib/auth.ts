import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AdminContext = {
  configured: boolean;
  user: User | null;
  isAdmin: boolean;
  supabase: SupabaseClient | null;
};

/**
 * Returns the current user and a database-backed admin check.
 *
 * This is used by both Server Actions and protected pages. Middleware is not
 * sufficient on its own: every privileged server operation must verify the
 * role itself.
 */
export async function getAdminContext(): Promise<AdminContext> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      user: null,
      isAdmin: false,
      supabase: null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      configured: true,
      user: null,
      isAdmin: false,
      supabase,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    configured: true,
    user,
    isAdmin: profile?.role === "admin",
    supabase,
  };
}
