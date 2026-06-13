import type { VendorBrand } from "@/lib/vendor-data";

export function isVendorBrandActive(brand: Partial<VendorBrand>): boolean;

export function vendorBrandOptionLabel(
  brand: Pick<VendorBrand, "name"> & Partial<VendorBrand>,
): string;

export function statusLabel(
  row: {
    isActive?: boolean | null;
    is_active?: boolean | null;
    platform_status?: string | null;
  },
): string;
