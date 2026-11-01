"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { safeNextPath } from "@/lib/safe-redirect";
import { getSiteUrl } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(320),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
});

function loginError(
  message: string,
  email?: string,
  next?: string,
): never {
  const params = new URLSearchParams({ error: message });
  if (email) params.set("email", email);
  if (next && next !== "/") params.set("next", next);
  redirect(`/login?${params.toString()}`);
}

function parseCredentials(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    loginError(
      parsed.error.issues[0]?.message ?? "Check your email and password.",
      typeof formData.get("email") === "string" ? String(formData.get("email")) : undefined,
      safeNextPath(formData.get("next")),
    );
  }

  return parsed.data;
}

export async function signIn(formData: FormData): Promise<never> {
  const next = safeNextPath(formData.get("next"));
  const credentials = parseCredentials(formData);

  if (!isSupabaseConfigured()) {
    loginError(
      "Authentication is not configured yet. Add the public Supabase environment variables.",
      credentials.email,
      next,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    loginError(error.message, credentials.email, next);
  }

  redirect(next);
}

export async function signUp(formData: FormData): Promise<never> {
  const next = safeNextPath(formData.get("next"));
  const credentials = parseCredentials(formData);

  if (!isSupabaseConfigured()) {
    loginError(
      "Authentication is not configured yet. Add the public Supabase environment variables.",
      credentials.email,
      next,
    );
  }

  const supabase = await createClient();
  const callbackUrl = new URL("/auth/callback", getSiteUrl());
  callbackUrl.searchParams.set("next", next);

  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    loginError(error.message, credentials.email, next);
  }

  // If email confirmation is enabled in Supabase, no session is returned yet.
  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Account created. Check your email to confirm your address, then sign in.",
      )}`,
    );
  }

  redirect(next);
}

export async function signOut(): Promise<never> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login?message=You+have+been+signed+out.");
}
