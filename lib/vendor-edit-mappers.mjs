function readArray(primary, fallback) {
  if (Array.isArray(primary)) return primary;
  if (Array.isArray(fallback)) return fallback;
  return [];
}

function readBoolean(value, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

function readText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function brandRowToFormValues(row) {
  return {
    id: row.id,
    name: readText(row.name),
    description: readText(row.description),
    logoUrls: readArray(row.logoUrls, row.logo_urls),
    isActive: readBoolean(row.isActive, readBoolean(row.is_active)),
  };
}

export function storeRowToFormValues(row) {
  const locationParts = [row.address_line1, row.city, row.state]
    .map(readText)
    .filter(Boolean);

  return {
    id: row.id,
    name: readText(row.name),
    address: readText(row.address) || locationParts.join(", "),
    imageUrls: readArray(row.imageUrls, row.image_urls),
    is_active: readBoolean(row.is_active),
  };
}
