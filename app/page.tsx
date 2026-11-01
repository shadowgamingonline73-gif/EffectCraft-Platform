"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import {
  ArrowRight,
  Bot,
  Cpu,
  ExternalLink,
  ShieldCheck,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";

import { ThreeBackground } from "@/components/ThreeBackground";
import rawCatalog from "@/catalog.json";

interface PluginItem {
  id: string;
  name: string;
  category: string;
  imagePath: string;
  binaryPath: string;
}

const catalog = rawCatalog as PluginItem[];
const featuredPlugins = catalog.slice(0, 8);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const highlights = [
  {
    icon: Zap,
    title: "Instant WASM execution",
    description:
      "Zero pipeline compilation wait times. Run 60 FPS shaders directly in the browser's WebAssembly runtime.",
    tone: "violet",
  },
  {
    icon: Sliders,
    title: "Parametric color & blur",
    description:
      "High-precision 32-bit buffers preserve dynamic range, anamorphic flares, and cinema-grade glints.",
    tone: "cyan",
  },
  {
    icon: ShieldCheck,
    title: "Production-ready presets",
    description:
      "Export directly to DaVinci Resolve, Premiere Pro, or web-based canvas render pipelines.",
    tone: "indigo",
  },
] as const;

const toneStyles = {
  violet: "border-violet-400/20 bg-violet-500/10 text-violet-300",
  cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
  indigo: "border-indigo-400/20 bg-indigo-500/10 text-indigo-300",
} as const;

export default function HomePage() {
  return (
    <div className="relative min-h-dvh">
      <ThreeBackground />

      <div className="relative z-10">
        {/* Hero */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-4xl space-y-8 text-center"
          >
            <motion.div variants={itemVariants} className="inline-block">
              <div className="glass-panel-subtle inline-flex flex-wrap items-center justify-center gap-2.5 rounded-full border border-violet-400/25 px-4 py-1.5 text-[11px] font-medium text-slate-200 sm:text-sm">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                <span className="font-semibold text-violet-200">
                  Effectcraft Suite
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300">
                  WebAssembly real-time VFX engine
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display text-5xl font-black leading-[1.04] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl"
            >
              Create without{" "}
              <span className="text-gradient-primary">limits.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300 sm:text-xl"
            >
              Empower your timeline with zero-latency WebAssembly video
              effects, cinema-grade prism shaders, and an intelligent creative
              copilot built for modern editors.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              <Link
                href="/library"
                className="group relative inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-violet-600/30 transition-all duration-300 hover:from-violet-500 hover:to-cyan-400 hover:shadow-cyan-500/30 active:scale-95"
              >
                <Sparkles className="h-5 w-5 text-cyan-200 transition-transform duration-300 group-hover:rotate-12" />
                Explore plugins
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("effectcraft:open-assistant"),
                  )
                }
                className="group inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-base font-semibold text-slate-200 backdrop-blur-md transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/[0.07] hover:text-white active:scale-95"
              >
                <Bot className="h-5 w-5 text-cyan-300 transition-transform group-hover:scale-110" />
                Ask AI Assistant
              </button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500"
            >
              <span>65+ GPU modules</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />
              <span>Zero-latency preview</span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />
              <span>Resolve · Premiere · Web</span>
            </motion.div>
          </motion.div>
        </section>

        {/* Featured plugins */}
        <section className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/[0.07] pb-5 md:flex-row md:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                <Zap className="h-3.5 w-3.5" />
                Curated selection
              </div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Featured plugins
              </h2>
              <p className="mt-1 text-sm text-slate-400 sm:text-base">
                Real-time WebAssembly GPU modules with live preview renders.
              </p>
            </div>

            <Link
              href="/library"
              className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-cyan-300"
            >
              View all {catalog.length} plugins
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {featuredPlugins.map((plugin) => (
              <motion.article
                key={plugin.id}
                variants={itemVariants}
                className="glass-panel group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-950/40"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950/80">
                  <Image
                    src={plugin.imagePath}
                    alt={plugin.name}
                    width={480}
                    height={270}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-transparent opacity-70 transition-opacity group-hover:opacity-50" />

                  <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md border border-white/10 bg-slate-950/75 px-2 py-0.5 text-[10px] font-mono font-medium text-cyan-300 backdrop-blur-md">
                    <Cpu className="h-3 w-3 text-cyan-400" />
                    WASM
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                  <div>
                    <span className="mb-2 inline-block rounded-full border border-violet-400/25 bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium tracking-wide text-violet-200">
                      {plugin.category}
                    </span>

                    <h3 className="font-display text-lg font-bold tracking-tight text-white transition-colors group-hover:text-cyan-200">
                      {plugin.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-xs text-slate-400">
                    <span className="max-w-[150px] truncate font-mono text-[10px] text-slate-500">
                      {plugin.id}
                    </span>

                    <Link
                      href={`/library?plugin=${plugin.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
                    >
                      Inspect
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* Value highlights */}
        <section className="relative mx-auto my-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-panel grid grid-cols-1 gap-6 rounded-3xl p-6 sm:p-8 md:grid-cols-3">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;

              return (
                <div key={highlight.title} className="flex items-start gap-4">
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border ${toneStyles[highlight.tone]}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-white">
                      {highlight.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {highlight.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
