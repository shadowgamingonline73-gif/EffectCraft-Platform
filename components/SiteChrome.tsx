"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * The library is an app-style surface with its own sidebar, so it opts out of
 * the marketing navbar and footer while keeping the floating AI assistant.
 */
export function SiteChrome({
  children,
  navbar,
  footer,
  assistant,
}: {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
  assistant: ReactNode;
}) {
  const pathname = usePathname();
  const isLibrary = pathname.startsWith("/library");

  if (isLibrary) {
    return (
      <main className="relative z-10 min-h-dvh w-full">
        {children}
        {assistant}
      </main>
    );
  }

  return (
    <>
      {navbar}
      <main className="relative z-10 w-full flex-1 pt-20">{children}</main>
      {footer}
      {assistant}
    </>
  );
}

export default SiteChrome;
