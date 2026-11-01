import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Box,
  CalendarDays,
  ExternalLink,
  FileCode2,
  Layers,
  ShieldCheck,
} from "lucide-react";

import { UploadForm } from "@/components/admin/UploadForm";
import { getAdminContext } from "@/lib/auth";
import { getPluginAssetUrl } from "@/lib/storage";
import { signOut } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "Manage the Effectcraft plugin marketplace.",
};

export const dynamic = "force-dynamic";

type PluginRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  image_path: string | null;
  file_path: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: PluginRow["status"] }) {
  const styles =
    status === "published"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : status === "draft"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
        : "border-white/10 bg-white/[0.04] text-white/45";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${styles}`}
    >
      {status}
    </span>
  );
}

export default async function AdminPage() {
  const context = await getAdminContext();

  if (!context.configured) {
    redirect(
      "/login?error=Supabase+is+not+configured.+Add+the+public+environment+variables.",
    );
  }

  if (!context.user) {
    redirect("/login?next=/admin");
  }

  if (!context.isAdmin || !context.supabase) {
    redirect("/?error=You+do+not+have+administrator+access.");
  }

  const { data, error } = await context.supabase
    .from("plugins")
    .select(
      "id, name, description, category, version, image_path, file_path, status, created_at",
    )
    .order("created_at", { ascending: false });

  const plugins = (data ?? []) as PluginRow[];
  const publishedCount = plugins.filter((plugin) => plugin.status === "published").length;
  const draftCount = plugins.filter((plugin) => plugin.status === "draft").length;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-300">
            <ShieldCheck className="size-3.5" />
            Administrator access verified
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Plugin control room
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
            Upload validated WASM modules, publish marketplace entries, and
            review every plugin in the catalogue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/plugins"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/70 transition hover:border-white/20 hover:text-white"
          >
            View marketplace
            <ArrowUpRight className="size-4" />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/60 transition hover:border-rose-400/30 hover:text-rose-200"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/35">
            <Layers className="size-3.5" />
            Total plugins
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-white">
            {plugins.length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/35">
            <ExternalLink className="size-3.5" />
            Published
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-emerald-300">
            {publishedCount}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/35">
            <Box className="size-3.5" />
            Drafts
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-amber-300">
            {draftCount}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,380px)_1fr]">
        <UploadForm />

        <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025]">
          <div className="flex flex-col gap-1 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Catalogue
              </h2>
              <p className="mt-0.5 text-sm text-white/40">
                Every record, including drafts and archived entries.
              </p>
            </div>
            <span className="text-xs text-white/30">
              Signed in as {context.user.email ?? "administrator"}
            </span>
          </div>

          {error ? (
            <div className="m-5 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-200">
              Could not load the catalogue: {error.message}
            </div>
          ) : plugins.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <FileCode2 className="size-5 text-white/30" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">
                No plugins yet
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/40">
                Use the upload form to add the first validated WASM plugin to
                the catalogue.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/30">
                    <th className="px-5 py-3 font-medium">Plugin</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Version</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-5 py-3 text-right font-medium">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {plugins.map((plugin) => {
                    const imageUrl = getPluginAssetUrl(plugin.image_path);

                    return (
                      <tr
                        key={plugin.id}
                        className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt=""
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-cyan-400/10">
                                  <FileCode2 className="size-4 text-white/30" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                {plugin.name}
                              </p>
                              <p className="mt-0.5 line-clamp-1 max-w-[260px] text-xs text-white/35">
                                {plugin.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-white/55">
                          {plugin.category}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-white/45">
                          {plugin.version}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={plugin.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs text-white/35">
                            <CalendarDays className="size-3.5" />
                            {formatDate(plugin.created_at)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {plugin.status === "published" ? (
                            <Link
                              href={`/plugins/${plugin.id}`}
                              className="inline-flex size-8 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.06] hover:text-white"
                              aria-label={`Open ${plugin.name}`}
                            >
                              <ArrowUpRight className="size-4" />
                            </Link>
                          ) : (
                            <span className="text-xs text-white/20">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
