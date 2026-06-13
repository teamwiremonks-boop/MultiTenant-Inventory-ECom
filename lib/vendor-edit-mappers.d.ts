import type { BrandValues, StoreValues } from "@/lib/schemas/vendor";
import type { VendorBrand, VendorStore } from "@/lib/vendor-data";

export function brandRowToFormValues(
  row: VendorBrand,
): Partial<BrandValues> & { id?: string };

export function storeRowToFormValues(
  row: VendorStore,
): Partial<StoreValues> & { id?: string };
