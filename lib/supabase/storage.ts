"use client";

import { createClient } from "@/lib/supabase/client";
import { buildPublicAssetPath } from "@/lib/supabase/storage-path.mjs";

type UploadPublicImageOptions = {
  bucket?: string;
  folder: "brand" | "stores" | "products";
  file: File;
  vendorId: string;
};

export async function uploadPublicImage({
  bucket = "public-assets",
  folder,
  file,
  vendorId,
}: UploadPublicImageOptions) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const supabase = createClient();
  const path = buildPublicAssetPath({
    fileName: file.name,
    folder,
    id: crypto.randomUUID(),
    vendorId,
  });

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}
