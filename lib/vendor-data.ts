export type VendorBrand = {
  id: string;
  name: string;
  description?: string | null;
  logoUrls?: string[] | null;
  logo_urls?: string[] | null;
  isActive?: boolean | null;
  is_active?: boolean | null;
  platform_status?: string | null;
};

export type VendorProduct = {
  id: string;
  name: string;
  description?: string | null;
  brand_id?: string | null;
  brandName?: string | null;
  brand_name?: string | null;
  basePrice?: number | string | null;
  base_price?: number | string | null;
  productImages?: string[] | null;
  product_images?: string[] | null;
  imageUrls?: string[] | null;
  image_urls?: string[] | null;
  isActive?: boolean | null;
  is_active?: boolean | null;
  platform_status?: string | null;
};

export type VendorStore = {
  id: string;
  name: string;
  address?: string | null;
  address_line1?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  imageUrls?: string[] | null;
  image_urls?: string[] | null;
  is_active?: boolean | null;
  platform_status?: string | null;
};

export type VendorWorkspace = {
  vendorId?: string;
  vendorName: string;
  platformStatus?: string;
  isSuspended: boolean;
};

export {
  isVendorBrandActive,
  statusLabel,
  vendorBrandOptionLabel,
} from "@/lib/vendor-data.mjs";

export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];

  if (
    typeof value === "object" &&
    value !== null &&
    "items" in value &&
    Array.isArray((value as { items: unknown }).items)
  ) {
    return (value as { items: T[] }).items;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray((value as { data: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }

  return [];
}
