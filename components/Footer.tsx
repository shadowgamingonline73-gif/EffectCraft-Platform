import Link from "next/link";
import {
  ArrowUpRight,
  Github,
  Instagram,
  LifeBuoy,
  Mail,
  Sparkles,
  Twitter,
  Youtube,
} from "lucide-react";

const footerColumns = [
  {
    title: "Marketplace",
    links: [
      { label: "All plugins", href: "/library" },
      { label: "Marketplace", href: "/plugins" },
      { label: "Support", href: "/support" },
      { label: "Report a bug", href: "/support#report" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "mailto:support@effectcraft.com" },
      { label: "System status", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Licenses", href: "#" },
    ],
  },
];

const socials = [
  { label: "Effectcraft on X", href: "#", icon: Twitter },
  { label: "Effectcraft on GitHub", href: "#", icon: Github },
  { label: "Effectcraft on YouTube", href: "#", icon: Youtube },
  { label: "Effectcraft on Instagram", href: "#", icon: Instagram },
];

export function Footer() {
  return (
    <footer className="relative z-10 px-4 pb-8 pt-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="glass-panel overflow-hidden rounded-3xl">
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div className="max-w-sm">
              <Link
                href="/"
                className="group inline-flex items-center gap-3"
                aria-label="Effectcraft home"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-400 p-px shadow-lg shadow-violet-500/20">
                  <span className="grid h-full w-full place-items-center rounded-[11px] bg-slate-950/90">
                    <Sparkles className="h-5 w-5 text-cyan-300 transition-transform duration-300 group-hover:rotate-12" />
                  </span>
                </span>
                <span className="font-display text-lg font-extrabold tracking-tight text-white">
                  Effect<span className="text-gradient-accent">craft</span>
                </span>
              </Link>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Premium plugins, overlays, and sound design for editors who
                care about the details. Built for the timeline.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[11px] font-medium text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                All systems operational
              </div>
            </div>

            {/* Link columns */}
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                        {link.href.startsWith("mailto:") && (
                          <Mail className="h-3 w-3 text-slate-600 transition-colors group-hover:text-cyan-300" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col gap-4 border-t border-white/[0.07] px-7 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span>
                © {new Date().getFullYear()} Effectcraft. All rights reserved.
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />
              <Link
                href="/support"
                className="inline-flex items-center gap-1 text-slate-400 transition-colors hover:text-cyan-300"
              >
                <LifeBuoy className="h-3 w-3" />
                Support
              </Link>
            </div>

            <div className="flex items-center gap-1.5">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    title={`${social.label} (coming soon)`}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-slate-500 transition-colors hover:border-violet-400/30 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                );
              })}
              <Link
                href="/library"
                className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-cyan-300"
              >
                Browse plugins
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
