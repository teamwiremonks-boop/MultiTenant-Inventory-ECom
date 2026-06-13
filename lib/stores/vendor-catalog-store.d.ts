import type { StoreApi } from "zustand/vanilla";

import type { ActionResult } from "@/lib/actions/_shared/results";
import type {
  VendorBrand,
  VendorStore,
  VendorWorkspace,
} from "@/lib/vendor-data";

export type VendorCatalogLoaders = {
  loadBrands: () => Promise<ActionResult<VendorBrand[]>>;
  loadStores: () => Promise<ActionResult<VendorStore[]>>;
  loadWorkspace: () => Promise<ActionResult<VendorWorkspace | null>>;
};

export type VendorCatalogState = {
  brands: VendorBrand[];
  brandsById: Record<string, VendorBrand>;
  error: string | null;
  loaded: boolean;
  loaders: VendorCatalogLoaders;
  loading: boolean;
  stores: VendorStore[];
  storesById: Record<string, VendorStore>;
  workspace: VendorWorkspace | null;
  loadCatalog: (options?: { force?: boolean }) => Promise<void>;
  refreshBrands: () => Promise<void>;
  refreshStores: () => Promise<void>;
};

export function createVendorCatalogStore(
  loaders?: Partial<VendorCatalogLoaders>,
): StoreApi<VendorCatalogState>;
