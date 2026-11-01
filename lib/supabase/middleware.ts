import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "@/lib/supabase/config";

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function redirectWithCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
  searchParams?: Record<string, string>,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

/**
 * Refreshes the Supabase session cookie and protects authenticated routes.
 *
 * This runs on every matched request. Authorization for admin-only operations
 * must still be checked server-side in pages, Server Actions, and Route
 * Handlers. Middleware is a routing guard, not the authorization boundary.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const env = getSupabaseEnv();
  const pathname = request.nextUrl.pathname;

  if (!env.configured) {
    if (isAdminPath(pathname)) {
      return redirectWithCookies(request, NextResponse.next({ request }), "/login", {
        next: `${pathname}${request.nextUrl.search}`,
        error: "Supabase is not configured. Add the public Supabase environment variables.",
      });
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Do not add logic between client creation and getUser(). Supabase needs this
  // call to refresh expired access tokens and keep cookies in sync.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminPath(pathname) && !user) {
    return redirectWithCookies(request, response, "/login", {
      next: `${pathname}${request.nextUrl.search}`,
    });
  }

  if (pathname === "/login" && user) {
    return redirectWithCookies(request, response, "/");
  }

  return response;
}
