export function buildPublicAssetPath({ folder, fileName, vendorId, id }) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "bin";
  const safeName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `vendors/${vendorId}/${folder}/${id}-${safeName || "image"}.${extension}`;
}
