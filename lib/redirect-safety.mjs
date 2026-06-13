export function safeNextPath(value, fallback = "/") {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("://")) return fallback;
  return value;
}
