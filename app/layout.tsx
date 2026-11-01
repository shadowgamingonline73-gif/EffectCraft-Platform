import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AiAssistant } from "@/components/AiAssistant";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: {
    default: "Effectcraft",
    template: "%s - Effectcraft",
  },
  description:
    "Premium creative plugins, overlays, sound effects, and tutorials for modern editors.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-white min-h-screen flex flex-col font-sans selection:bg-violet-500/30 selection:text-cyan-200 antialiased relative">
        {/* Ambient atmospheric backdrop lighting */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px]" />
          <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-violet-900/15 rounded-full blur-[150px]" />
        </div>

        <SiteChrome
          navbar={<Navbar />}
          footer={<Footer />}
          assistant={<AiAssistant />}
        >
          {children}
        </SiteChrome>

        <Toaster theme="dark" position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

