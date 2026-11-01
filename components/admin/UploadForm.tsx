"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileCode2,
  Image as ImageIcon,
  Loader2,
  PackagePlus,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

import {
  initialPluginActionState,
  type PluginActionState,
} from "@/lib/admin-types";

import { createPlugin } from "@/app/admin/actions";

const categories = [
  "Blur & Sharpen",
  "Light",
  "Stylize",
  "Distort",
  "Generate",
  "Color Correction",
  "Keying",
  "Time",
];

export function UploadForm() {
  const [state, formAction, pending] = useActionState(
    createPlugin,
    initialPluginActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const lastStateRef = useRef<PluginActionState>(initialPluginActionState);

  useEffect(() => {
    if (state.status === "idle" || state === lastStateRef.current) return;
    lastStateRef.current = state;

    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">
          <PackagePlus className="size-5 text-violet-300" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-white">
            Upload a plugin
          </h2>
          <p className="mt-1 text-sm leading-5 text-white/40">
            Files are validated server-side and stored in the plugin assets
            bucket. Only published entries appear in the marketplace.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-white/75">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={120}
            placeholder="S_Glow"
            className="h-10 w-full rounded-xl border border-white/10 bg-black/25 px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/15"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium text-white/75">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            maxLength={5000}
            rows={4}
            placeholder="What does this plugin do, and when should an editor use it?"
            className="w-full resize-y rounded-xl border border-white/10 bg-black/25 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/15"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="category" className="text-sm font-medium text-white/75">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue=""
              className="h-10 w-full rounded-xl border border-white/10 bg-black/25 px-3.5 text-sm text-white outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/15"
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="version" className="text-sm font-medium text-white/75">
              Version
            </label>
            <input
              id="version"
              name="version"
              required
              maxLength={40}
              defaultValue="1.0.0"
              placeholder="1.0.0"
              className="h-10 w-full rounded-xl border border-white/10 bg-black/25 px-3.5 font-mono text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/15"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="status" className="text-sm font-medium text-white/75">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="draft"
            className="h-10 w-full rounded-xl border border-white/10 bg-black/25 px-3.5 text-sm text-white outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/15"
          >
            <option value="draft">Draft — hidden from the marketplace</option>
            <option value="published">Published — visible to everyone</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-6 text-center transition hover:border-violet-400/40 hover:bg-violet-400/[0.04]">
            <FileCode2 className="mb-2 size-6 text-white/35 transition group-hover:text-violet-300" />
            <span className="text-sm font-medium text-white/75">.wasm binary</span>
            <span className="mt-1 text-xs text-white/35">Maximum 5 MB</span>
            <input
              name="wasm"
              type="file"
              required
              accept=".wasm,application/wasm"
              className="mt-3 block w-full max-w-[180px] text-xs text-white/45 file:mr-2 file:rounded-lg file:border-0 file:bg-white/10 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-white/70 hover:file:bg-white/15"
            />
          </label>

          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-6 text-center transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.04]">
            <ImageIcon className="mb-2 size-6 text-white/35 transition group-hover:text-cyan-300" />
            <span className="text-sm font-medium text-white/75">PNG preview</span>
            <span className="mt-1 text-xs text-white/35">Maximum 5 MB</span>
            <input
              name="image"
              type="file"
              required
              accept="image/png,.png"
              className="mt-3 block w-full max-w-[180px] text-xs text-white/45 file:mr-2 file:rounded-lg file:border-0 file:bg-white/10 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-white/70 hover:file:bg-white/15"
            />
          </label>
        </div>

        {state.status !== "idle" ? (
          <div
            role={state.status === "error" ? "alert" : "status"}
            className={
              state.status === "success"
                ? "flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-3.5 py-3 text-sm leading-5 text-emerald-200"
                : "flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-3.5 py-3 text-sm leading-5 text-rose-200"
            }
          >
            {state.status === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{state.message}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Uploading and validating…
            </>
          ) : (
            <>
              <UploadCloud className="size-4" />
              Upload plugin
            </>
          )}
        </button>
      </div>
    </form>
  );
}
