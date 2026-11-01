"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Boxes,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Focus,
  Heart,
  Home,
  Image as ImageIcon,
  Images,
  LayoutDashboard,
  LayoutGrid,
  Library as LibraryIcon,
  List,
  Menu,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  ScanFace,
  Search,
  Sparkles,
  Sun,
  Video,
  Wand2,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import type {
  LibraryLayout,
  LibraryPlugin,
  LibrarySort,
  LibraryView,
} from "./types";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  category?: string;
  view?: LibraryView;
  badge?: "BETA" | "NEW";
};

type Collection = {
  title: string;
  description: string;
  category: string;
};

type ResolvedCollection = Collection & {
  count: number;
  image: string;
};

const BROWSE_ITEMS: NavItem[] = [
  { id: "all", label: "All Plugins", icon: Boxes, category: "All" },
  {
    id: "blur",
    label: "Blur & Sharpen",
    icon: Focus,
    category: "Blur & Sharpen",
  },
  { id: "light", label: "Light & Glow", icon: Sun, category: "Light" },
  { id: "color", label: "Color", icon: Palette, category: "Color Correction" },
  { id: "distort", label: "Distort", icon: Waves, category: "Distort" },
  { id: "stylize", label: "Stylize", icon: Wand2, category: "Stylize" },
];

const STUDIO_ITEMS: NavItem[] = [
  { id: "edit-video", label: "Edit Video", icon: Video, badge: "BETA" },
  { id: "edit-image", label: "Edit Image", icon: ImageIcon },
  { id: "bg-change", label: "BG Change", icon: ScanFace },
  {
    id: "moodboard",
    label: "Moodboard",
    icon: LayoutDashboard,
    badge: "BETA",
  },
  { id: "frame-extract", label: "Frame Extract", icon: Images, badge: "NEW" },
];

const ASSET_ITEMS: NavItem[] = [
  { id: "library", label: "Library", icon: LibraryIcon, view: "library" },
  { id: "downloads", label: "Downloads", icon: Download, view: "downloads" },
  { id: "favorites", label: "Favorites", icon: Heart, view: "favorites" },
];

const COLLECTIONS: Collection[] = [
  {
    title: "Cinematic Light",
    description: "Flares, rays, and bloom for frames that glow.",
    category: "Light",
  },
  {
    title: "Analog Texture",
    description: "Grain, halation, and filmic imperfections.",
    category: "Stylize",
  },
  {
    title: "Motion & Blur",
    description: "Directional blur, speed ramps, and defocus.",
    category: "Blur & Sharpen",
  },
  {
    title: "Color Grade",
    description: "Spectral shifts and precision color balance.",
    category: "Color Correction",
  },
];

const TICKER_ITEMS = [
  "Color",
  "Light",
  "Blur",
  "Distort",
  "Stylize",
  "Keying",
  "Time",
  "Generate",
];

const NOISE_BACKGROUND =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")";

const CATEGORY_LABELS: Record<string, string> = {
  "Blur & Sharpen": "Blur & Sharpen",
  "Color Correction": "Color",
  Distort: "Distort",
  Generate: "Generate",
  Keying: "Keying",
  Light: "Light & Glow",
  Stylize: "Stylize",
  Time: "Time",
};

function categoryLabel(category: string) {
  if (category === "All") return "All Plugins";
  return CATEGORY_LABELS[category] ?? category;
}

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                   */
/* -------------------------------------------------------------------------- */

function SidebarSection({
  label,
  collapsed,
  children,
}: {
  label: string;
  collapsed: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mt-4">
      <div
        className={`flex items-center gap-2 px-3 pb-1.5 ${
          collapsed ? "lg:hidden" : ""
        }`}
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/25">
          {label}
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      title={item.label}
      aria-current={active ? "page" : undefined}
      className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-all duration-200 ${
        active
          ? "bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          : "text-white/55 hover:bg-white/[0.035] hover:text-white"
      } ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400 shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
      )}
      <Icon
        className={`h-4 w-4 shrink-0 transition-colors ${
          active
            ? "text-cyan-300"
            : "text-white/35 group-hover:text-white/70"
        }`}
      />
      <span
        className={`flex-1 truncate text-left ${collapsed ? "lg:hidden" : ""}`}
      >
        {item.label}
      </span>
      {item.badge && (
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-bold tracking-wider ${
            item.badge === "BETA"
              ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
              : "border-violet-400/30 bg-violet-400/10 text-violet-200"
          } ${collapsed ? "lg:hidden" : ""}`}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}

function LibrarySidebar({
  activeView,
  activeCategory,
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onCloseMobile,
  onBrowse,
  onAsset,
  onStudio,
  onDownloadAll,
}: {
  activeView: LibraryView;
  activeCategory: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
  onBrowse: (category: string) => void;
  onAsset: (view: LibraryView) => void;
  onStudio: (label: string) => void;
  onDownloadAll: () => void;
}) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close library navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-[75] bg-black/70 backdrop-blur-md lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[80] flex w-[280px] shrink-0 flex-col overflow-hidden border-r border-white/[0.06] bg-[#08080b] transition-all duration-300 ${
          collapsed ? "lg:w-[76px]" : "lg:w-[280px]"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:z-auto lg:translate-x-0`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

        <div
          className={`flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-4 ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <Link
            href="/"
            title="Effectcraft home"
            className={`group flex min-w-0 items-center gap-2.5 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-lg shadow-violet-950/40">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <span className="truncate font-display text-lg font-extrabold tracking-tight text-white">
              Effect<span className="text-gradient-accent">craft</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-8 w-8 place-items-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white lg:grid"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close library navigation"
            className="grid h-8 w-8 place-items-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 [scrollbar-color:rgba(255,255,255,0.14)_transparent] [scrollbar-width:thin]">
          <Link
            href="/"
            title="Home"
            className={`group flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium text-white/55 transition-colors hover:bg-white/[0.035] hover:text-white ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <Home className="h-4 w-4 shrink-0 text-white/35 group-hover:text-white/70" />
            <span className={collapsed ? "lg:hidden" : ""}>Home</span>
          </Link>

          <SidebarSection label="Browse" collapsed={collapsed}>
            {BROWSE_ITEMS.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={
                  activeView === "browse" && activeCategory === item.category
                }
                collapsed={collapsed}
                onClick={() => onBrowse(item.category ?? "All")}
              />
            ))}
          </SidebarSection>

          <SidebarSection label="Studio" collapsed={collapsed}>
            {STUDIO_ITEMS.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={false}
                collapsed={collapsed}
                onClick={() => onStudio(item.label)}
              />
            ))}
          </SidebarSection>

          <SidebarSection label="Assets" collapsed={collapsed}>
            {ASSET_ITEMS.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={activeView === item.view}
                collapsed={collapsed}
                onClick={() => onAsset(item.view ?? "library")}
              />
            ))}
          </SidebarSection>
        </nav>

        <div className="relative shrink-0 border-t border-white/[0.06] p-3">
          <div className="pointer-events-none absolute inset-x-4 bottom-4 h-10 rounded-full bg-white/10 blur-xl" />
          <div
            className={`relative mb-2 flex items-center justify-between px-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/25 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            <span>Studio status</span>
            <span className="flex items-center gap-1 text-emerald-300/80">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              Online
            </span>
          </div>
          <button
            type="button"
            onClick={onDownloadAll}
            title="Download plugin suite"
            className={`relative flex h-10 w-full items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-[#07070a] shadow-lg shadow-black/20 transition-all hover:bg-cyan-50 active:scale-[0.99] ${
              collapsed ? "lg:px-0" : ""
            }`}
          >
            <Download className="h-4 w-4 shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>
              Download plugin suite
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Top bar                                                                   */
/* -------------------------------------------------------------------------- */

function LibraryTopbar({
  heading,
  search,
  onSearch,
  layout,
  onLayout,
  mobileOpen,
  onOpenMobile,
  progress,
}: {
  heading: string;
  search: string;
  onSearch: (value: string) => void;
  layout: LibraryLayout;
  onLayout: (layout: LibraryLayout) => void;
  mobileOpen: boolean;
  onOpenMobile: () => void;
  progress: MotionValue<number>;
}) {
  return (
    <header className="relative sticky top-0 z-30 border-b border-white/[0.06] bg-[#07070a]/85 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open library navigation"
          aria-expanded={mobileOpen}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:text-white lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <span className="min-w-0 truncate font-display text-sm font-semibold text-white sm:hidden">
          {heading}
        </span>

        <div className="hidden min-w-0 items-center gap-1.5 text-[11px] text-white/30 sm:flex">
          <span>Workspace</span>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-white/65">{heading}</span>
        </div>

        <div className="relative order-3 w-full min-w-0 sm:order-none sm:w-auto sm:max-w-md sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            id="library-search"
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") onSearch("");
            }}
            placeholder="Search plugins, effects, categories..."
            aria-label="Search the library"
            className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-9 pr-16 text-sm text-white placeholder:text-white/25 transition-colors focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] font-medium text-white/25 sm:flex">
              ⌘K
            </kbd>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/plugins"
            className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:text-white sm:inline-flex"
          >
            Marketplace
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>

          <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
            <button
              type="button"
              onClick={() => onLayout("grid")}
              aria-label="Grid view"
              aria-pressed={layout === "grid"}
              className={`grid h-8 w-8 place-items-center rounded-md transition-colors ${
                layout === "grid"
                  ? "bg-white/[0.1] text-white"
                  : "text-white/35 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onLayout("list")}
              aria-label="List view"
              aria-pressed={layout === "list"}
              className={`grid h-8 w-8 place-items-center rounded-md transition-colors ${
                layout === "list"
                  ? "bg-white/[0.1] text-white"
                  : "text-white/35 hover:text-white"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <div
            title="Effectcraft workspace"
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-[11px] font-bold text-white shadow-lg shadow-violet-950/30 ring-1 ring-white/20"
          >
            EC
          </div>
        </div>
      </div>

      <motion.div
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400"
      />
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Editorial sections                                                        */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-end">
      <div>
        <div className="mb-1.5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          <span className="h-1 w-1 rounded-full bg-cyan-400" />
          {eyebrow}
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-xl text-sm leading-6 text-white/40">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function CategoryTicker() {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden border-y border-white/[0.06] bg-white/[0.01] py-3.5"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#07070a] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#07070a] to-transparent" />
      <motion.div
        className="flex w-max will-change-transform"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0 items-center gap-8 pr-8">
            {TICKER_ITEMS.map((item) => (
              <span
                key={`${group}-${item}`}
                className="flex items-center gap-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40"
              >
                {item}
                <span className="h-1 w-1 rounded-full bg-violet-400/70" />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function FeaturedDrop({
  plugin,
  total,
  categoryCount,
  imageY,
  onPreview,
  onExplore,
}: {
  plugin: LibraryPlugin;
  total: number;
  categoryCount: number;
  imageY: MotionValue<number>;
  onPreview: () => void;
  onExplore: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0b10] shadow-2xl shadow-black/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(124,58,237,0.24),transparent_45%),radial-gradient(circle_at_82%_100%,rgba(34,211,238,0.12),transparent_45%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse at top, black, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at top, black, transparent 72%)",
        }}
      />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-600/15 blur-[110px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[110px]" />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </span>
              New drop
            </span>
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/25">
              01 / {total}
            </span>
          </div>

          <h1 className="mt-5 max-w-xl font-display text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
            Find your next{" "}
            <span className="text-gradient-primary">look.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/45 sm:text-base">
            {total} GPU-accelerated effects, built for editors who care about
            the details. Preview, favorite, and drop them straight into your
            timeline.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onPreview}
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#07070a] shadow-xl shadow-white/5 transition-all hover:bg-cyan-50 active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Preview effect
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={onExplore}
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/65 backdrop-blur-md transition-all hover:border-cyan-400/30 hover:text-white active:scale-[0.98]"
            >
              Explore {categoryLabel(plugin.category)}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5">
              {total} plugins
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5">
              {categoryCount} categories
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5">
              WASM / 60fps
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -inset-5 rounded-[2rem] bg-violet-600/20 blur-3xl" />
          <motion.div
            style={{ y: imageY }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={plugin.imagePath}
                alt={`${plugin.name} preview`}
                fill
                priority
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080b] via-transparent to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live preview
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
                    {categoryLabel(plugin.category)}
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-white">
                    {plugin.name}
                  </p>
                </div>
                <span className="rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-[9px] text-white/50 backdrop-blur-md">
                  WASM
                </span>
              </div>
            </div>
          </motion.div>

          <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-white/10 bg-[#0c0c10]/90 p-3 shadow-xl backdrop-blur-md sm:block">
            <div className="flex items-center gap-2 text-[10px] text-white/45">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/15 text-violet-300">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span>
                <span className="block font-semibold text-white/80">
                  GPU accelerated
                </span>
                Zero-latency preview
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Collections({
  plugins,
  onSelect,
}: {
  plugins: LibraryPlugin[];
  onSelect: (category: string) => void;
}) {
  const collections = useMemo(
    () =>
      COLLECTIONS.flatMap((collection): ResolvedCollection[] => {
        const items = plugins.filter(
          (plugin) => plugin.category === collection.category,
        );
        const image = items[0]?.imagePath;
        return image
          ? [{ ...collection, count: items.length, image }]
          : [];
      }),
    [plugins],
  );

  if (collections.length === 0) return null;

  return (
    <section>
      <SectionHeading
        eyebrow="Curated"
        title="Collections"
        description="Tightly edited groups of effects, grouped by the look they create."
      />
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {collections.map((collection, index) => (
          <motion.button
            key={collection.title}
            type="button"
            onClick={() => onSelect(collection.category)}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.5,
              delay: index * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="group relative w-[82vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c10] text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/30 hover:shadow-2xl hover:shadow-violet-950/25 sm:w-auto sm:shrink"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={collection.image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-[#0c0c10]/15 to-transparent" />
              <span className="absolute left-3 top-3 rounded border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[9px] text-white/50 backdrop-blur-md">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-base font-bold text-white">
                  {collection.title}
                </h3>
                <span className="shrink-0 text-[9px] uppercase tracking-[0.14em] text-white/30">
                  {collection.count} effects
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-white/40">
                {collection.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-300 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                Explore
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function StudioTools({ onSelect }: { onSelect: (label: string) => void }) {
  return (
    <section>
      <SectionHeading
        eyebrow="Studio"
        title="Create, not just browse"
        description="The tools around the library. Edit, extract, and build the look before you touch the timeline."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {STUDIO_ITEMS.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.label)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.45,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c10] p-4 text-left transition-all duration-300 hover:border-violet-400/30 hover:bg-white/[0.03]"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition-colors group-hover:bg-violet-500/20" />
              <div className="relative flex items-start justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/55 transition-colors group-hover:text-cyan-300">
                  <Icon className="h-4 w-4" />
                </span>
                {item.badge && (
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[8px] font-bold tracking-wider ${
                      item.badge === "BETA"
                        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                        : "border-violet-400/30 bg-violet-400/10 text-violet-200"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="relative mt-5 font-display text-sm font-semibold text-white">
                {item.label}
              </p>
              <p className="relative mt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/25">
                Coming soon
              </p>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

function CategoryChips({
  categories,
  activeView,
  activeCategory,
  onSelect,
}: {
  categories: string[];
  activeView: LibraryView;
  activeCategory: string;
  onSelect: (category: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {["All", ...categories].map((category) => {
        const isActive =
          category === "All"
            ? activeView === "library" ||
              (activeView === "browse" && activeCategory === "All")
            : activeView === "browse" && activeCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-all ${
              isActive
                ? "border-white bg-white text-[#07070a] shadow-[0_0_20px_rgba(255,255,255,0.12)]"
                : "border-white/[0.08] bg-white/[0.025] text-white/50 hover:border-white/20 hover:text-white"
            }`}
          >
            {category === "All" ? "All effects" : categoryLabel(category)}
          </button>
        );
      })}
    </div>
  );
}

function ResultsToolbar({
  count,
  search,
  sort,
  onSort,
  showClear,
  onClear,
}: {
  count: number;
  search: string;
  sort: LibrarySort;
  onSort: (sort: LibrarySort) => void;
  showClear: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
          {count} {count === 1 ? "effect" : "effects"}
        </p>
        {search && (
          <span className="text-[11px] text-white/25">
            for <span className="text-white/60">&quot;{search}&quot;</span>
          </span>
        )}
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-300/80 transition-colors hover:text-cyan-200"
          >
            Clear
          </button>
        )}
      </div>

      <div className="relative">
        <select
          value={sort}
          onChange={(event) => onSort(event.target.value as LibrarySort)}
          aria-label="Sort plugins"
          className="h-9 appearance-none rounded-lg border border-white/10 bg-white/[0.03] pl-3 pr-8 text-xs text-white/70 transition-colors focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        >
          <option value="featured">Featured</option>
          <option value="name">Name A–Z</option>
          <option value="category">Category</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
      </div>
    </div>
  );
}

function CompactHeader({
  heading,
  subtitle,
  onBack,
}: {
  heading: string;
  subtitle: string;
  onBack: () => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] pb-5">
      <div>
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Library view
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {heading}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
          {subtitle}
        </p>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45 transition-colors hover:border-white/20 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to library
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Plugin cards                                                              */
/* -------------------------------------------------------------------------- */

function PluginCard({
  plugin,
  index,
  isFavorite,
  isDownloaded,
  onPreview,
  onFavorite,
  onDownload,
}: {
  plugin: LibraryPlugin;
  index: number;
  isFavorite: boolean;
  isDownloaded: boolean;
  onPreview: () => void;
  onFavorite: () => void;
  onDownload: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.025, 0.2),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c10] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/30 hover:shadow-2xl hover:shadow-violet-950/25"
    >
      <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl border border-transparent transition-colors duration-300 group-hover:border-violet-400/20" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(420px_circle_at_50%_0%,rgba(124,58,237,0.12),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <button
        type="button"
        onClick={onPreview}
        aria-label={`Preview ${plugin.name}`}
        className="relative block aspect-video w-full overflow-hidden bg-slate-900 text-left"
      >
        <Image
          src={plugin.imagePath}
          alt={`${plugin.name} preview`}
          fill
          loading={index === 0 ? "eager" : "lazy"}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080b] via-[#08080b]/10 to-transparent" />

        {index < 3 && (
          <span className="absolute left-2.5 top-2.5 rounded border border-violet-400/30 bg-violet-500/20 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-violet-100 backdrop-blur-md">
            New
          </span>
        )}
        <span className="absolute right-2.5 top-2.5 rounded border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-cyan-200 backdrop-blur-md">
          WASM
        </span>
        <span className="absolute bottom-2.5 left-2.5 rounded border border-white/10 bg-black/35 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-white/55 backdrop-blur-md">
          {categoryLabel(plugin.category)}
        </span>

        <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md">
            <Play className="h-3 w-3 fill-current" />
            Preview
          </span>
        </span>
      </button>

      <div className="relative p-3 sm:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-sm font-semibold text-white">
              {plugin.name}
            </h3>
            <p className="mt-0.5 hidden truncate font-mono text-[10px] text-white/25 sm:block">
              {plugin.id}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onFavorite}
              aria-label={
                isFavorite
                  ? `Remove ${plugin.name} from favorites`
                  : `Add ${plugin.name} to favorites`
              }
              aria-pressed={isFavorite}
              className={`grid h-7 w-7 place-items-center rounded-lg border transition-colors sm:h-8 sm:w-8 ${
                isFavorite
                  ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
                  : "border-white/[0.07] bg-white/[0.02] text-white/30 hover:border-white/20 hover:text-white"
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={onDownload}
              aria-label={
                isDownloaded
                  ? `${plugin.name} downloaded`
                  : `Download ${plugin.name}`
              }
              className={`grid h-7 w-7 place-items-center rounded-lg border transition-colors sm:h-8 sm:w-8 ${
                isDownloaded
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-white/[0.07] bg-white/[0.02] text-white/30 hover:border-violet-400/40 hover:text-violet-200"
              }`}
            >
              {isDownloaded ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function PluginRow({
  plugin,
  index,
  isFavorite,
  isDownloaded,
  isLast,
  onPreview,
  onFavorite,
  onDownload,
}: {
  plugin: LibraryPlugin;
  index: number;
  isFavorite: boolean;
  isDownloaded: boolean;
  isLast: boolean;
  onPreview: () => void;
  onFavorite: () => void;
  onDownload: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-3 p-2.5 transition-colors hover:bg-white/[0.025] sm:gap-4 ${
        isLast ? "" : "border-b border-white/[0.06]"
      }`}
    >
      <button
        type="button"
        onClick={onPreview}
        aria-label={`Preview ${plugin.name}`}
        className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-900"
      >
        <Image
          src={plugin.imagePath}
          alt=""
          fill
          loading={index === 0 ? "eager" : "lazy"}
          sizes="96px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-black/20" />
      </button>

      <button
        type="button"
        onClick={onPreview}
        className="min-w-0 flex-1 text-left"
      >
        <p className="truncate font-display text-sm font-semibold text-white">
          {plugin.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-white/30">
          {categoryLabel(plugin.category)} · {plugin.id}
        </p>
      </button>

      <span className="hidden rounded border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-cyan-200 sm:block">
        WASM
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onFavorite}
          aria-label={
            isFavorite
              ? `Remove ${plugin.name} from favorites`
              : `Add ${plugin.name} to favorites`
          }
          aria-pressed={isFavorite}
          className={`grid h-7 w-7 place-items-center rounded-lg border transition-colors sm:h-8 sm:w-8 ${
            isFavorite
              ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
              : "border-white/[0.07] bg-white/[0.02] text-white/30 hover:border-white/20 hover:text-white"
          }`}
        >
          <Heart
            className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`}
          />
        </button>
        <button
          type="button"
          onClick={onDownload}
          aria-label={
            isDownloaded
              ? `${plugin.name} downloaded`
              : `Download ${plugin.name}`
          }
          className={`grid h-7 w-7 place-items-center rounded-lg border transition-colors sm:h-8 sm:w-8 ${
            isDownloaded
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-white/[0.07] bg-white/[0.02] text-white/30 hover:border-violet-400/40 hover:text-violet-200"
          }`}
        >
          {isDownloaded ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Preview modal                                                             */
/* -------------------------------------------------------------------------- */

function PluginPreview({
  plugin,
  isFavorite,
  isDownloaded,
  onClose,
  onFavorite,
  onDownload,
}: {
  plugin: LibraryPlugin | null;
  isFavorite: boolean;
  isDownloaded: boolean;
  onClose: () => void;
  onFavorite: () => void;
  onDownload: () => void;
}) {
  return (
    <AnimatePresence>
      {plugin && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${plugin.name} preview`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0b10] shadow-2xl shadow-black/60 [scrollbar-color:rgba(255,255,255,0.14)_transparent] [scrollbar-width:thin]"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
              <Image
                src={plugin.imagePath}
                alt={`${plugin.name} preview`}
                fill
                loading="eager"
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b10] via-transparent to-transparent" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close preview"
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <span className="absolute left-4 top-4 rounded-md border border-white/10 bg-black/50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white/70 backdrop-blur-md">
                {categoryLabel(plugin.category)}
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                    {plugin.name}
                  </h2>
                  <p className="mt-1 font-mono text-[11px] text-white/30">
                    {plugin.id}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onFavorite}
                    aria-pressed={isFavorite}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      isFavorite
                        ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
                        : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white"
                    }`}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${
                        isFavorite ? "fill-current" : ""
                      }`}
                    />
                    {isFavorite ? "Favorited" : "Favorite"}
                  </button>

                  <button
                    type="button"
                    onClick={onDownload}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      isDownloaded
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white"
                    }`}
                  >
                    {isDownloaded ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    {isDownloaded ? "Downloaded" : "Download"}
                  </button>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">
                A GPU-accelerated {categoryLabel(plugin.category).toLowerCase()}{" "}
                effect built for the Effectcraft timeline. Preview it in the
                library, then drop it into your next project.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: "Format", value: "WASM" },
                  { label: "Category", value: categoryLabel(plugin.category) },
                  { label: "Engine", value: "Effectcraft GPU" },
                  { label: "Version", value: "1.0" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2.5"
                  >
                    <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/25">
                      {item.label}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-white/70">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
                <Link
                  href="/plugins"
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35 transition-colors hover:text-cyan-300"
                >
                  View in marketplace
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <span className="ml-auto text-[9px] uppercase tracking-[0.14em] text-white/20">
                  Preview renders from the Effectcraft catalog
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*  Library experience                                                        */
/* -------------------------------------------------------------------------- */

export function LibraryExperience({ plugins }: { plugins: LibraryPlugin[] }) {
  const [activeView, setActiveView] = useState<LibraryView>("library");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<LibrarySort>("featured");
  const [layout, setLayout] = useState<LibraryLayout>("grid");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [selectedPlugin, setSelectedPlugin] =
    useState<LibraryPlugin | null>(null);
  const [showTop, setShowTop] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress, scrollY } = useScroll({
    container: contentRef,
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });
  const heroImageY = useTransform(scrollYProgress, [0, 0.22], [0, -28]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setShowTop(latest > 700);
  });

  const categories = useMemo(
    () => Array.from(new Set(plugins.map((plugin) => plugin.category))).sort(),
    [plugins],
  );

  const featuredPlugin =
    plugins.find((plugin) => plugin.id === "prism-glow") ?? plugins[0];

  // Open a plugin preview when arriving from the homepage. Defer the state
  // update so hydration completes before the modal is mounted.
  useEffect(() => {
    const pluginId = new URLSearchParams(window.location.search).get("plugin");
    if (!pluginId) return;

    const match = plugins.find((plugin) => plugin.id === pluginId);
    if (!match) return;

    const timeout = window.setTimeout(() => setSelectedPlugin(match), 0);
    return () => window.clearTimeout(timeout);
  }, [plugins]);

  // Escape closes the preview.
  useEffect(() => {
    if (!selectedPlugin) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPlugin(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPlugin]);

  // Command/Ctrl + K focuses the library search.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("library-search")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sourcePlugins = useMemo(() => {
    if (activeView === "downloads") {
      return plugins.filter((plugin) => downloaded.has(plugin.id));
    }
    if (activeView === "favorites") {
      return plugins.filter((plugin) => favorites.has(plugin.id));
    }
    return plugins;
  }, [plugins, activeView, downloaded, favorites]);

  const visiblePlugins = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = sourcePlugins.filter((plugin) => {
      const matchesCategory =
        activeView === "browse" && activeCategory !== "All"
          ? plugin.category === activeCategory
          : true;
      const matchesQuery =
        !query ||
        `${plugin.name} ${plugin.category} ${plugin.id}`
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesQuery;
    });

    const sorted = [...filtered];

    if (sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "category") {
      sorted.sort(
        (a, b) =>
          a.category.localeCompare(b.category) ||
          a.name.localeCompare(b.name),
      );
    }

    return sorted;
  }, [sourcePlugins, search, activeView, activeCategory, sort]);

  const trimmedSearch = search.trim();
  const isDefaultView =
    activeView === "library" && !trimmedSearch && activeCategory === "All";
  const isLibraryView = activeView === "library" || activeView === "browse";

  const heading = trimmedSearch
    ? "Search results"
    : activeView === "library"
      ? "Library"
      : activeView === "browse"
        ? categoryLabel(activeCategory)
        : activeView === "downloads"
          ? "Downloads"
          : "Favorites";

  const subtitle = trimmedSearch
    ? activeView === "browse" && activeCategory !== "All"
      ? `Results for "${trimmedSearch}" in ${categoryLabel(activeCategory)}.`
      : `Results for "${trimmedSearch}" across the Effectcraft catalog.`
    : activeView === "library"
      ? "Your complete Effectcraft collection — every plugin, preview, and GPU module in one place."
      : activeView === "browse"
        ? `Browse ${
            activeCategory === "All"
              ? "every effect"
              : categoryLabel(activeCategory).toLowerCase()
          } in the Effectcraft library.`
        : activeView === "downloads"
          ? "Plugin bundles you've downloaded will appear here, ready to install."
          : "Your starred plugins, kept close for the next edit.";

  function scrollContentToTop() {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToAllEffects() {
    window.setTimeout(() => {
      document
        .getElementById("all-effects")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function handleBrowse(category: string) {
    setActiveView("browse");
    setActiveCategory(category);
    setSearch("");
    setMobileOpen(false);
    scrollContentToTop();
  }

  function handleAsset(view: LibraryView) {
    setActiveView(view);
    setActiveCategory("All");
    setSearch("");
    setMobileOpen(false);
    scrollContentToTop();
  }

  function handleStudio(label: string) {
    setMobileOpen(false);
    toast("Coming soon", {
      description: `${label} is in the Effectcraft studio pipeline.`,
    });
  }

  function handleCategory(category: string) {
    if (category === "All") {
      setActiveView("library");
      setActiveCategory("All");
      setSearch("");
      scrollContentToTop();
      return;
    }

    setActiveView("browse");
    setActiveCategory(category);
    scrollToAllEffects();
  }

  function handleCollection(category: string) {
    setActiveView("browse");
    setActiveCategory(category);
    setSearch("");
    setMobileOpen(false);
    scrollToAllEffects();
  }

  function handleDownload(plugin: LibraryPlugin) {
    setDownloaded((current) => {
      const next = new Set(current);
      next.add(plugin.id);
      return next;
    });

    toast.success("Download queued", {
      description: `${plugin.name} will be packaged for your workspace.`,
    });
  }

  function handleDownloadAll() {
    toast.success("Bundle queued", {
      description: `All ${plugins.length} plugins are being packaged into one download.`,
    });
  }

  function toggleFavorite(pluginId: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(pluginId)) {
        next.delete(pluginId);
      } else {
        next.add(pluginId);
      }
      return next;
    });
  }

  function clearFilters() {
    setSearch("");
    setActiveView("library");
    setActiveCategory("All");
    setSort("featured");
    scrollContentToTop();
  }

  const emptyState =
    activeView === "downloads"
      ? {
          icon: Download,
          title: "No downloads yet",
          description:
            "Download a plugin and it will appear here, ready to install.",
          action: "Browse library",
        }
      : activeView === "favorites"
        ? {
            icon: Heart,
            title: "No favorites yet",
            description:
              "Star a plugin to keep it within reach for your next edit.",
            action: "Browse library",
          }
        : {
            icon: Search,
            title: "No plugins found",
            description:
              "Try a different search term or clear the active category.",
            action: "Clear filters",
          };

  const EmptyIcon = emptyState.icon;
  const showClear =
    Boolean(trimmedSearch) ||
    activeView !== "library" ||
    activeCategory !== "All";

  function handleEmptyAction() {
    if (activeView === "downloads" || activeView === "favorites") {
      setActiveView("library");
      setActiveCategory("All");
      setSearch("");
      scrollContentToTop();
    } else {
      clearFilters();
    }
  }

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-[#07070a] text-white">
      <LibrarySidebar
        activeView={activeView}
        activeCategory={activeCategory}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapsed={() => setCollapsed((current) => !current)}
        onCloseMobile={() => setMobileOpen(false)}
        onBrowse={handleBrowse}
        onAsset={handleAsset}
        onStudio={handleStudio}
        onDownloadAll={handleDownloadAll}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <LibraryTopbar
          heading={heading}
          search={search}
          onSearch={setSearch}
          layout={layout}
          onLayout={setLayout}
          mobileOpen={mobileOpen}
          onOpenMobile={() => setMobileOpen(true)}
          progress={progress}
        />

        <div
          ref={contentRef}
          id="library-content"
          className="relative flex-1 overflow-y-auto [scrollbar-color:rgba(255,255,255,0.14)_transparent] [scrollbar-width:thin]"
        >
          <div
            className="pointer-events-none fixed inset-0 z-[3] opacity-[0.03] mix-blend-soft-light"
            style={{
              backgroundImage: NOISE_BACKGROUND,
              backgroundSize: "180px 180px",
            }}
          />

          <div className="relative mx-auto max-w-[1600px] px-4 pb-24 pt-5 sm:px-6 lg:px-8">
            {isDefaultView && featuredPlugin ? (
              <FeaturedDrop
                plugin={featuredPlugin}
                total={plugins.length}
                categoryCount={categories.length}
                imageY={heroImageY}
                onPreview={() => setSelectedPlugin(featuredPlugin)}
                onExplore={() => handleCollection(featuredPlugin.category)}
              />
            ) : null}

            {isDefaultView && (
              <div className="my-6">
                <CategoryTicker />
              </div>
            )}

            {isDefaultView && (
              <div className="space-y-10">
                <Collections plugins={plugins} onSelect={handleCollection} />
                <StudioTools onSelect={handleStudio} />
              </div>
            )}

            {!isDefaultView && (
              <CompactHeader
                heading={heading}
                subtitle={subtitle}
                onBack={clearFilters}
              />
            )}

            <section
              id="all-effects"
              className={`scroll-mt-24 ${
                isDefaultView ? "pt-12" : ""
              }`}
            >
              {isDefaultView && (
                <SectionHeading
                  eyebrow="The full catalog"
                  title="All effects"
                  description="Every plugin in the Effectcraft library, ready to preview and drop into your timeline."
                  action={
                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
                      {visiblePlugins.length} effects
                    </span>
                  }
                />
              )}

              {isLibraryView && (
                <CategoryChips
                  categories={categories}
                  activeView={activeView}
                  activeCategory={activeCategory}
                  onSelect={handleCategory}
                />
              )}

              <ResultsToolbar
                count={visiblePlugins.length}
                search={search}
                sort={sort}
                onSort={setSort}
                showClear={showClear}
                onClear={clearFilters}
              />

              {visiblePlugins.length === 0 ? (
                <div className="relative flex min-h-80 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-16 text-center">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.1),transparent_60%)]" />
                  <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
                    <EmptyIcon className="h-5 w-5" />
                  </div>
                  <h2 className="relative mt-4 font-display text-lg font-semibold text-white">
                    {emptyState.title}
                  </h2>
                  <p className="relative mt-2 max-w-sm text-sm leading-6 text-white/40">
                    {emptyState.description}
                  </p>
                  <button
                    type="button"
                    onClick={handleEmptyAction}
                    className="relative mt-5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#07070a] transition-colors hover:bg-cyan-50"
                  >
                    {emptyState.action}
                  </button>
                </div>
              ) : layout === "grid" ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {visiblePlugins.map((plugin, index) => (
                    <PluginCard
                      key={plugin.id}
                      plugin={plugin}
                      index={index}
                      isFavorite={favorites.has(plugin.id)}
                      isDownloaded={downloaded.has(plugin.id)}
                      onPreview={() => setSelectedPlugin(plugin)}
                      onFavorite={() => toggleFavorite(plugin.id)}
                      onDownload={() => handleDownload(plugin)}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0b10]/80">
                  {visiblePlugins.map((plugin, index) => (
                    <PluginRow
                      key={plugin.id}
                      plugin={plugin}
                      index={index}
                      isFavorite={favorites.has(plugin.id)}
                      isDownloaded={downloaded.has(plugin.id)}
                      isLast={index === visiblePlugins.length - 1}
                      onPreview={() => setSelectedPlugin(plugin)}
                      onFavorite={() => toggleFavorite(plugin.id)}
                      onDownload={() => handleDownload(plugin)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        <AnimatePresence>
          {showTop && (
            <motion.button
              type="button"
              onClick={scrollContentToTop}
              aria-label="Back to top"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-24 right-5 z-40 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#0c0c10]/90 text-white/55 shadow-xl backdrop-blur-md transition-colors hover:border-violet-400/30 hover:text-white"
            >
              <ArrowUp className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <PluginPreview
        plugin={selectedPlugin}
        isFavorite={
          selectedPlugin ? favorites.has(selectedPlugin.id) : false
        }
        isDownloaded={
          selectedPlugin ? downloaded.has(selectedPlugin.id) : false
        }
        onClose={() => setSelectedPlugin(null)}
        onFavorite={() => {
          if (selectedPlugin) toggleFavorite(selectedPlugin.id);
        }}
        onDownload={() => {
          if (selectedPlugin) handleDownload(selectedPlugin);
        }}
      />
    </div>
  );
}

export default LibraryExperience;
