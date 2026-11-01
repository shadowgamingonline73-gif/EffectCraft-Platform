import type { Metadata } from "next";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Download,
  FileCode2,
  LockKeyhole,
  Package,
  ShieldCheck,
} from "lucide-react";

import { getPluginAssetUrl } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PluginDetail = {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  image_path: string | null;
  file_path: string | null;
  status: "published";
  created_at: string;
};

const getPublishedPlugin = cache(async (id: string): Promise<PluginDetail | null> => {
  if (!isSupabaseConfigured() || !UUID_PATTERN.test(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plugins")
    .select(
      "id, name, description, category, version, image_path, file_path, status, created_at",
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) return null;
  return (data as PluginDetail | null) ?? null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const plugin = await getPublishedPlugin(id);

  if (!plugin) {
    return { title: "Plugin not found" };
  }

  const imageUrl = getPluginAssetUrl(plugin.image_path);

  return {
    title: plugin.name,
    description: plugin.description,
    openGraph: {
      title: `${plugin.name} · Effectcraft`,
      description: plugin.description,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      type: "website",
    },
  };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(value));
}

export default async function PluginDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const plugin = await getPublishedPlugin(id);

  if (!plugin) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const imageUrl = getPluginAssetUrl(plugin.image_path);
  const downloadHref = user
    ? `/api/plugins/${plugin.id}/download`
    : `/login?next=${encodeURIComponent(`/plugins/${plugin.id}`)}`;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/plugins"
        className="inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
      >
        <ArrowLeft className="size-4" />
        All plugins
      </Link>

      {query.error ? (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm leading-6 text-rose-200"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{query.error}</span>
        </div>
      ) : null}

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <div className="relative aspect-[16/10] bg-slate-900">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${plugin.name} preview`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.35),transparent_50%),linear-gradient(135deg,#0f172a,#09090f)]">
                <FileCode2 className="size-10 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>
        </div>

        <aside className="lg:sticky lg:top-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3 py-1 text-xs font-medium text-violet-200">
              {plugin.category}
            </span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1 text-xs font-medium text-emerald-300">
              Published
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            {plugin.name}
          </h1>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/50">
            {plugin.description}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-white/10 py-5">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-white/30">
                Version
              </dt>
              <dd className="mt-1 font-mono text-sm text-white/75">
                v{plugin.version}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-white/30">
                Format
              </dt>
              <dd className="mt-1 text-sm text-white/75">WebAssembly</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-white/30">
                Category
              </dt>
              <dd className="mt-1 text-sm text-white/75">{plugin.category}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-white/30">
                Published
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm text-white/75">
                <CalendarDays className="size-3.5 text-white/30" />
                {formatDate(plugin.created_at)}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            {plugin.file_path ? (
              <a
                href={downloadHref}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                {user ? (
                  <>
                    <Download className="size-4" />
                    Download .wasm
                  </>
                ) : (
                  <>
                    <LockKeyhole className="size-4" />
                    Sign in to download
                  </>
                )}
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white/35"
              >
                <Package className="size-4" />
                Download unavailable
              </button>
            )}

            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-white/30">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              Downloads require a signed-in account. The binary is delivered
              through a short-lived signed URL after the published status is
              verified.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
