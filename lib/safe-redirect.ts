/**
 * Only allow same-origin path redirects. This blocks open-redirect payloads
 * such as `//evil.example` and backslash variants.
 */
export function safeNextPath(value: FormDataEntryValue | string | null | undefined): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  return value;
}
