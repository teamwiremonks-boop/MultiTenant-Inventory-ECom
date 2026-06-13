import type {
  VendorBrand,
  VendorProduct,
  VendorStore,
} from "@/lib/vendor-data";

export function summarizeVendorDashboard(input: {
  brands?: VendorBrand[];
  products?: VendorProduct[];
  stores?: VendorStore[];
}): {
  brands: { active: number; inactive: number; total: number };
  products: {
    active: number;
    inactive: number;
    suspended: number;
    total: number;
  };
  stores: { active: number; inactive: number; total: number };
};
