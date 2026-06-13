import { createStore } from "zustand/vanilla";

const emptyLoaders = {
  loadBrands: async () => ({ ok: true, data: [] }),
  loadStores: async () => ({ ok: true, data: [] }),
  loadWorkspace: async () => ({ ok: true, data: null }),
};

function indexById(rows) {
  return Object.fromEntries(
    rows
      .filter((row) => row?.id)
      .map((row) => [row.id, row]),
  );
}

function readError(result) {
  return result?.ok === false
    ? result.error?.message ?? "Vendor catalog request failed."
    : null;
}

export function createVendorCatalogStore(loaders = emptyLoaders) {
  return createStore((set, get) => ({
    brands: [],
    brandsById: {},
    error: null,
    loaded: false,
    loaders: { ...emptyLoaders, ...loaders },
    loading: false,
    stores: [],
    storesById: {},
    workspace: null,

    async loadCatalog(options = {}) {
      if (get().loaded && !options.force) return;

      set({ error: null, loading: true });

      const currentLoaders = get().loaders;
      const [brandResult, storeResult, workspaceResult] = await Promise.all([
        currentLoaders.loadBrands(),
        currentLoaders.loadStores(),
        currentLoaders.loadWorkspace(),
      ]);

      const error =
        readError(brandResult) ??
        readError(storeResult) ??
        readError(workspaceResult);

      set({
        brands: brandResult.ok ? brandResult.data ?? [] : get().brands,
        brandsById: brandResult.ok
          ? indexById(brandResult.data ?? [])
          : get().brandsById,
        error,
        loaded: !error,
        loading: false,
        stores: storeResult.ok ? storeResult.data ?? [] : get().stores,
        storesById: storeResult.ok
          ? indexById(storeResult.data ?? [])
          : get().storesById,
        workspace: workspaceResult.ok
          ? workspaceResult.data
          : get().workspace,
      });
    },

    async refreshBrands() {
      const result = await get().loaders.loadBrands();

      if (result.ok) {
        set({
          brands: result.data ?? [],
          brandsById: indexById(result.data ?? []),
          error: null,
        });
      } else {
        set({ error: readError(result) });
      }
    },

    async refreshStores() {
      const result = await get().loaders.loadStores();

      if (result.ok) {
        set({
          error: null,
          stores: result.data ?? [],
          storesById: indexById(result.data ?? []),
        });
      } else {
        set({ error: readError(result) });
      }
    },
  }));
}
