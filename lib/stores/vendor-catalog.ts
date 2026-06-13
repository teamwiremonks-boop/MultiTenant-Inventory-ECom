"use client";

import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";

import type { ActionResult } from "@/lib/actions/_shared/results";
import { getBrands } from "@/lib/actions/vendor/brands";
import { getVendorStores } from "@/lib/actions/vendor/stores";
import { getVendorWorkspace } from "@/lib/actions/vendor/workspace";
import { createVendorCatalogStore as createVendorCatalogStoreUntyped } from "@/lib/stores/vendor-catalog-store.mjs";
import {
  asArray,
  type VendorBrand,
  type VendorStore,
  type VendorWorkspace,
} from "@/lib/vendor-data";

type VendorCatalogLoaders = {
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

const createVendorCatalogStore = createVendorCatalogStoreUntyped as (
  loaders: VendorCatalogLoaders,
) => StoreApi<VendorCatalogState>;

export const vendorCatalogStore = createVendorCatalogStore({
  loadBrands: async () => {
    const result = await getBrands();

    if (!result.ok) return result;

    return {
      ok: true,
      data: asArray<VendorBrand>(result.data),
    };
  },
  loadStores: getVendorStores,
  loadWorkspace: getVendorWorkspace,
});

export function useVendorCatalog<T>(
  selector: (state: VendorCatalogState) => T,
) {
  return useStore(vendorCatalogStore, selector);
}

export const vendorCatalogActions = {
  loadCatalog: (options?: { force?: boolean }) =>
    vendorCatalogStore.getState().loadCatalog(options),
  refreshBrands: () => vendorCatalogStore.getState().refreshBrands(),
  refreshStores: () => vendorCatalogStore.getState().refreshStores(),
};
