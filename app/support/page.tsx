import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Bug,
  Clock3,
  LifeBuoy,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { BugReportForm } from "@/components/BugReportForm";

export const metadata: Metadata = {
  title: "Support & Bug Reports",
  description:
    "Get help with Effectcraft plugins, report a bug, or send a reproducible issue to the engineering team.",
};

const supportCards = [
  {
    title: "Report a bug",
    description: "Send us the steps and we'll reproduce it.",
    href: "#report",
    icon: Bug,
    tone: "text-violet-300 border-violet-400/20 bg-violet-500/10",
  },
  {
    title: "Email support",
    description: "support@effectcraft.com",
    href: "mailto:support@effectcraft.com",
    icon: Mail,
    tone: "text-cyan-300 border-cyan-400/20 bg-cyan-500/10",
  },
  {
    title: "System status",
    description: "All services operational.",
    href: "#",
    icon: ShieldCheck,
    tone: "text-emerald-300 border-emerald-400/20 bg-emerald-500/10",
  },
];

export default function SupportPage() {
  return (
    <div className="relative min-h-dvh">
      {/* Ambient page glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,rgba(124,58,237,0.2),transparent_40%),radial-gradient(circle_at_88%_18%,rgba(34,211,238,0.08),transparent_32%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <header className="mx-auto mt-10 max-w-3xl text-center">
          <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200">
            <LifeBuoy className="h-3.5 w-3.5 text-cyan-300" />
            Support center
          </span>

          <h1 className="mt-6 font-display text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-6xl">
            Tell us what broke.{" "}
            <span className="text-gradient-primary">We&apos;ll fix it fast.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
            Something not rendering the way it should? Send us the plugin,
            your editor version, and the exact steps. Reproducible reports go
            straight to the graphics engineering queue.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span className="glass-panel-subtle inline-flex items-center gap-2 rounded-full px-3.5 py-1.5">
              <Clock3 className="h-3.5 w-3.5 text-cyan-300" />
              Average response under 24 hours
            </span>
            <span className="glass-panel-subtle inline-flex items-center gap-2 rounded-full px-3.5 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              Reports reviewed by engineers
            </span>
          </div>
        </header>

        {/* Quick contact cards */}
        <section className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">
          {supportCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                href={card.href}
                className="glass-panel-subtle group flex items-start gap-3 rounded-2xl border border-white/[0.07] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04]"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${card.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">
                    {card.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">
                    {card.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </section>

        {/* Form */}
        <section id="report" className="mt-12 scroll-mt-24">
          <div className="mx-auto mb-6 flex max-w-3xl items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <Bug className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Report an issue
              </h2>
              <p className="text-xs text-slate-500">
                Fields marked with <span className="text-violet-300">*</span>{" "}
                are required.
              </p>
            </div>
            <Sparkles className="ml-auto hidden h-4 w-4 text-cyan-300/60 sm:block" />
          </div>

          <BugReportForm />
        </section>
      </div>
    </div>
  );
}
