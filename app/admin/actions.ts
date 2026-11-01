"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { PluginActionState } from "@/lib/admin-types";
import { getAdminContext } from "@/lib/auth";

const MAX_WASM_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const pluginSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(5000),
  category: z.string().trim().min(1, "Choose a category.").max(80),
  version: z
    .string()
    .trim()
    .min(1, "Version is required.")
    .max(40)
    .regex(
      /^[0-9A-Za-z][0-9A-Za-z._-]*$/,
      "Version can only contain letters, numbers, dots, underscores, and hyphens.",
    ),
  status: z.enum(["draft", "published"]).default("draft"),
});

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

function hasWasmMagic(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const bytes = new Uint8Array(buffer, 0, 4);
  return bytes[0] === 0x00 && bytes[1] === 0x61 && bytes[2] === 0x73 && bytes[3] === 0x6d;
}

function hasPngMagic(buffer: ArrayBuffer): boolean {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.byteLength < signature.length) return false;
  const bytes = new Uint8Array(buffer, 0, signature.length);
  return signature.every((value, index) => bytes[index] === value);
}

function validateWasmFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".wasm")) {
    return "The plugin file must use the .wasm extension.";
  }
  if (file.size > MAX_WASM_BYTES) {
    return "The .wasm file must be 5 MB or smaller.";
  }
  if (
    file.type &&
    file.type !== "application/wasm" &&
    file.type !== "application/octet-stream"
  ) {
    return "The plugin file has an unsupported MIME type.";
  }
  return null;
}

function validatePngFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".png")) {
    return "The preview image must use the .png extension.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "The preview image must be 5 MB or smaller.";
  }
  if (file.type && file.type !== "image/png") {
    return "The preview image must be a PNG file.";
  }
  return null;
}

function failure(message: string): PluginActionState {
  return { status: "error", message };
}

export async function createPlugin(
  _previousState: PluginActionState,
  formData: FormData,
): Promise<PluginActionState> {
  const context = await getAdminContext();

  if (!context.configured) {
    return failure("Supabase is not configured. Add the environment variables first.");
  }

  if (!context.user) {
    return failure("Your session has expired. Sign in again.");
  }

  if (!context.isAdmin || !context.supabase) {
    return failure("You do not have permission to publish plugins.");
  }

  const parsed = pluginSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    category: formData.get("category"),
    version: formData.get("version"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Check the plugin details.");
  }

  const wasmValue = formData.get("wasm");
  const imageValue = formData.get("image");

  if (!isFile(wasmValue)) {
    return failure("Choose a .wasm plugin file.");
  }
  if (!isFile(imageValue)) {
    return failure("Choose a PNG preview image.");
  }

  const wasmError = validateWasmFile(wasmValue);
  if (wasmError) return failure(wasmError);

  const imageError = validatePngFile(imageValue);
  if (imageError) return failure(imageError);

  const [wasmBuffer, imageBuffer] = await Promise.all([
    wasmValue.arrayBuffer(),
    imageValue.arrayBuffer(),
  ]);

  if (!hasWasmMagic(wasmBuffer)) {
    return failure("The selected file is not a valid WebAssembly module.");
  }

  if (!hasPngMagic(imageBuffer)) {
    return failure("The selected preview is not a valid PNG image.");
  }

  const assetId = crypto.randomUUID();
  const basePath = `plugins/${assetId}`;
  const wasmPath = `${basePath}/plugin.wasm`;
  const imagePath = `${basePath}/preview.png`;

  const { error: wasmUploadError } = await context.supabase.storage
    .from("plugin_assets")
    .upload(wasmPath, wasmBuffer, {
      contentType: "application/wasm",
      cacheControl: "3600",
      upsert: false,
    });

  if (wasmUploadError) {
    return failure(`Could not upload the plugin binary: ${wasmUploadError.message}`);
  }

  const { error: imageUploadError } = await context.supabase.storage
    .from("plugin_assets")
    .upload(imagePath, imageBuffer, {
      contentType: "image/png",
      cacheControl: "3600",
      upsert: false,
    });

  if (imageUploadError) {
    await context.supabase.storage.from("plugin_assets").remove([wasmPath]);
    return failure(`Could not upload the preview image: ${imageUploadError.message}`);
  }

  const { error: insertError } = await context.supabase.from("plugins").insert({
    name: parsed.data.name,
    description: parsed.data.description,
    category: parsed.data.category,
    version: parsed.data.version,
    image_path: imagePath,
    file_path: wasmPath,
    status: parsed.data.status,
  });

  if (insertError) {
    await context.supabase.storage.from("plugin_assets").remove([wasmPath, imagePath]);
    return failure(`Could not save the plugin: ${insertError.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/plugins");
  revalidatePath("/");

  return {
    status: "success",
    message:
      parsed.data.status === "published"
        ? "Plugin published and added to the marketplace."
        : "Plugin saved as a draft.",
  };
}
