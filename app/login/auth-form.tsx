"use client";

import { useFormStatus } from "react-dom";

import { signIn, signUp } from "./actions";

function SubmitButton({
  children,
  disabled,
  variant = "primary",
  formAction,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={isDisabled}
      className={
        variant === "primary"
          ? "inline-flex h-11 items-center justify-center rounded-xl bg-violet-500 px-5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
          : "inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}

export function AuthForm({
  next,
  email,
  error,
  message,
  configured,
}: {
  next: string;
  email: string;
  error?: string;
  message?: string;
  configured: boolean;
}) {
  return (
    <form action={signIn} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm leading-6 text-rose-200"
        >
          {error}
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-3 text-sm leading-6 text-emerald-200"
        >
          {message}
        </div>
      ) : null}

      {!configured ? (
        <div
          role="status"
          className="rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3 text-sm leading-6 text-amber-200"
        >
          Supabase is not configured. Add{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          to <code className="font-mono text-xs">.env.local</code>.
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-white/80">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={email}
          disabled={!configured}
          placeholder="you@example.com"
          className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/15 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-white/80">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="current-password"
          disabled={!configured}
          placeholder="At least 8 characters"
          className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/15 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        <SubmitButton disabled={!configured}>Sign in</SubmitButton>
        <SubmitButton formAction={signUp} disabled={!configured} variant="secondary">
          Create account
        </SubmitButton>
      </div>

      <p className="text-xs leading-5 text-white/35">
        Creating an account may require email confirmation, depending on your
        Supabase project settings. We only collect your email address.
      </p>
    </form>
  );
}
