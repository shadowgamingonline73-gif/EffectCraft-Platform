import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Boxes, FileCode2, Sparkles } from "lucide-react";

import { getPluginAssetUrl } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Plugins",
  description:
    "Browse published Effectcraft plugins for compositing, colour, motion, light, and keying.",
};

export const dynamic = "force-dynamic";

type PublicPlugin = {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  image_path: string | null;
  created_at: string;
};

export default async function PluginsPage() {
  const configured = isSupabaseConfigured();
  let plugins: PublicPlugin[] = [];
  let loadError: string | null = null;

  if (configured) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("plugins")
      .select("id, name, description, category, version, image_path, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    plugins = (data ?? []) as PublicPlugin[];
    loadError = error?.message ?? null;
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.2),transparent_42%),radial-gradient(circle_at_85%_100%,rgba(34,211,238,0.1),transparent_38%)]" />
        <div className="relative max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3 py-1.5 text-xs font-medium text-violet-200">
            <Sparkles className="size-3.5" />
            Published catalogue
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
            Plugins built for the cut.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/45">
            Explore validated WebAssembly effects for light, colour, motion,
            texture, keying, and time. Every listing is published by the
            Effectcraft administrator.
          </p>
        </div>
      </section>

      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            Marketplace
          </h2>
          <p className="mt-1 text-sm text-white/35">
            {plugins.length} published {plugins.length === 1 ? "plugin" : "plugins"}
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-white/40 transition hover:text-white"
        >
          Back home
        </Link>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.07] px-5 py-4 text-sm text-rose-200">
          Could not load the marketplace: {loadError}
        </div>
      ) : !configured ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
            <Boxes className="size-5 text-amber-300" />
          </div>
          <h3 className="font-display text-lg font-semibold text-white">
            Marketplace not connected
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
            Add the Supabase environment variables and run the migrations to
            load published plugins from PostgreSQL.
          </p>
        </div>
      ) : plugins.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <FileCode2 className="size-5 text-white/30" />
          </div>
          <h3 className="font-display text-lg font-semibold text-white">
            No published plugins yet
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
            The administrator has not published a plugin. Check back after the
            first upload is released.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plugins.map((plugin) => {
            const imageUrl = getPluginAssetUrl(plugin.image_path);

            return (
              <Link
                key={plugin.id}
                href={`/plugins/${plugin.id}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-violet-950/20"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`${plugin.name} preview`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.35),transparent_50%),linear-gradient(135deg,#0f172a,#09090f)]">
                      <FileCode2 className="size-8 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 backdrop-blur-md">
                    {plugin.category}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-semibold text-white">
                        {plugin.name}
                      </h3>
                      <p className="mt-1 font-mono text-[11px] text-white/30">
                        v{plugin.version}
                      </p>
                    </div>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/35 transition group-hover:border-violet-400/30 group-hover:text-violet-200">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-5 text-white/40">
                    {plugin.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
