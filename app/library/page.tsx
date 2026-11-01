import type { Metadata } from "next";

import { LibraryExperience } from "@/components/library/LibraryExperience";
import type { LibraryPlugin } from "@/components/library/types";
import rawCatalog from "@/catalog.json";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Browse the complete Effectcraft plugin library — GPU-accelerated effects, presets, and WASM modules for your next edit.",
};

export default function LibraryPage() {
  return <LibraryExperience plugins={rawCatalog as LibraryPlugin[]} />;
}
