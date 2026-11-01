"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Layers,
  Library,
  LifeBuoy,
  Shield,
  LogIn,
  Sliders,
  ChevronRight,
  User,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const pathname = usePathname();

  // Dynamic Auth State Check (Login / Admin)
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (!isSupabaseConfigured()) {
        if (isMounted) setIsLoadingAuth(false);
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !isMounted) {
          if (isMounted) {
            setUserEmail(null);
            setIsAdmin(false);
            setIsLoadingAuth(false);
          }
          return;
        }

        setUserEmail(user.email ?? null);

        // Check if role is admin in profile or app metadata
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        const role = profile?.role ?? user.app_metadata?.role;
        if (isMounted) {
          setIsAdmin(role === "admin");
          setIsLoadingAuth(false);
        }
      } catch {
        if (isMounted) {
          setIsLoadingAuth(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const navLinks = [
    { name: "Plugins", href: "/plugins", icon: Layers },
    { name: "Library", href: "/library", icon: Library },
    { name: "Support", href: "/support", icon: LifeBuoy },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/55 shadow-lg shadow-black/20 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Left: Effectcraft Wordmark */}
          <Link
            href="/"
            className="group flex items-center gap-3 transition-transform active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-400 p-[1px] shadow-sm shadow-violet-500/30">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Sliders className="h-5 w-5 text-cyan-400 transition-transform duration-300 group-hover:rotate-12" />
              </div>
            </div>
            <span className="font-display text-2xl font-extrabold tracking-tight text-white transition-colors group-hover:text-slate-100">
              Effect<span className="text-gradient-accent">craft</span>
            </span>
          </Link>

          {/* Middle: Links to Plugins and Support */}
          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-base font-medium transition-colors hover:text-white ${
                    isActive
                      ? "font-semibold text-cyan-400"
                      : "text-slate-300"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Dynamic Login / Admin Button */}
          <div className="hidden items-center gap-3 md:flex">
            {isLoadingAuth ? (
              <div className="h-10 w-32 animate-pulse rounded-xl bg-white/5" />
            ) : isAdmin ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-indigo-500 active:scale-95"
              >
                <Shield className="h-4 w-4 text-cyan-300" />
                <span>Admin Panel</span>
              </Link>
            ) : userEmail ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10 active:scale-95"
              >
                <User className="h-4 w-4 text-cyan-400" />
                <span>Account</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 shadow-sm transition-all hover:border-violet-500/40 hover:bg-white/10 hover:text-white active:scale-95"
              >
                <LogIn className="h-4 w-4 text-cyan-400" />
                <span>Login / Admin</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-7 w-7 text-cyan-400" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Hamburger Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="animate-in fade-in slide-in-from-top-3 space-y-3 border-b border-white/10 bg-black/90 px-4 pb-6 pt-4 backdrop-blur-xl duration-200 md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 font-semibold text-cyan-400"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-slate-400" />
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </Link>
              );
            })}
          </div>

          <div className="border-t border-white/10 pt-3">
            {isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-600/30"
              >
                <Shield className="h-4 w-4 text-cyan-300" />
                <span>Admin Panel</span>
              </Link>
            ) : userEmail ? (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-200"
              >
                <User className="h-4 w-4 text-cyan-400" />
                <span>Account Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-600/20"
              >
                <LogIn className="h-4 w-4" />
                <span>Login / Admin</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
