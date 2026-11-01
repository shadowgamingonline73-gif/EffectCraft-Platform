import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeDownloadName(name: string, version: string): string {
  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "effectcraft-plugin";
  const safeVersion =
    version.replace(/[^0-9a-z._-]+/gi, "-").replace(/^-+|-+$/g, "") || "1.0.0";

  return `${slug}-${safeVersion}.wasm`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const marketplaceUrl = new URL("/plugins", request.url);
  const detailUrl = new URL(`/plugins/${encodeURIComponent(id)}`, request.url);

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.redirect(marketplaceUrl);
  }

  if (!isSupabaseConfigured()) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "error",
      "Downloads are unavailable until Supabase is configured.",
    );
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `/plugins/${id}`);
    return NextResponse.redirect(loginUrl);
  }

  const { data: plugin, error } = await supabase
    .from("plugins")
    .select("id, name, version, file_path, status")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !plugin?.file_path) {
    detailUrl.searchParams.set("error", "This plugin is not available for download.");
    return NextResponse.redirect(detailUrl);
  }

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from("plugin_assets")
    .createSignedUrl(plugin.file_path, 60, {
      download: safeDownloadName(plugin.name, plugin.version),
    });

  if (signedUrlError || !signedUrl?.signedUrl) {
    detailUrl.searchParams.set(
      "error",
      "The download could not be prepared. Please try again.",
    );
    return NextResponse.redirect(detailUrl);
  }

  return NextResponse.redirect(signedUrl.signedUrl);
}
