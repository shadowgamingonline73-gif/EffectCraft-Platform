import { getSupabaseEnv } from "@/lib/supabase/config";

/**
 * Converts a stored storage object path into a public URL for the
 * `plugin_assets` bucket. Full URLs are passed through for backwards
 * compatibility.
 */
export function getPluginAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return path;

  const { url } = getSupabaseEnv();
  if (!url) return null;

  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${url.replace(/\/$/, "")}/storage/v1/object/public/plugin_assets/${encodedPath}`;
}
