export type LibraryPlugin = {
  id: string;
  name: string;
  category: string;
  imagePath: string;
  binaryPath: string;
};

export type LibraryView = "library" | "browse" | "downloads" | "favorites";
export type LibraryLayout = "grid" | "list";
export type LibrarySort = "featured" | "name" | "category";
