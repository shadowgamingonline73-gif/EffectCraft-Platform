import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeNextPath } from "@/lib/safe-redirect";

import { AuthForm } from "./auth-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Effectcraft or create an account.",
};

type LoginSearchParams = {
  error?: string;
  message?: string;
  next?: string;
  email?: string;
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const configured = isSupabaseConfigured();

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(124,58,237,0.2),transparent_40%),radial-gradient(circle_at_90%_90%,rgba(34,211,238,0.08),transparent_35%)]" />
      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to Effectcraft
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">
              <span className="size-2.5 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.9)]" />
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
              Enter the craft.
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Sign in to download plugins and track your bug reports.
            </p>
          </div>

          <AuthForm
            next={next}
            email={params.email ?? ""}
            error={params.error}
            message={params.message}
            configured={configured}
          />
        </div>
      </div>
    </main>
  );
}
