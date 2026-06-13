import assert from "node:assert/strict";
import { test } from "node:test";

import { createVendorCatalogStore } from "../lib/stores/vendor-catalog-store.mjs";

const workspace = {
  vendorId: "vendor-1",
  vendorName: "Vendor One",
  isSuspended: false,
};

const brands = [
  { id: "brand-1", name: "Brand One" },
  { id: "brand-2", name: "Brand Two" },
];

const stores = [
  { id: "store-1", name: "Store One" },
  { id: "store-2", name: "Store Two" },
];

function ok(data) {
  return { ok: true, data };
}

test("vendor catalog store loads workspace, brands, stores, and ID maps once", async () => {
  const calls = { brands: 0, stores: 0, workspace: 0 };
  const store = createVendorCatalogStore({
    loadBrands: async () => {
      calls.brands += 1;
      return ok(brands);
    },
    loadStores: async () => {
      calls.stores += 1;
      return ok(stores);
    },
    loadWorkspace: async () => {
      calls.workspace += 1;
      return ok(workspace);
    },
  });

  await store.getState().loadCatalog();
  await store.getState().loadCatalog();

  const state = store.getState();

  assert.deepEqual(calls, { brands: 1, stores: 1, workspace: 1 });
  assert.equal(state.workspace.vendorName, "Vendor One");
  assert.equal(state.brandsById["brand-2"].name, "Brand Two");
  assert.equal(state.storesById["store-1"].name, "Store One");
  assert.equal(state.loaded, true);
  assert.equal(state.error, null);
});

test("vendor catalog store refreshes brands and stores independently", async () => {
  const store = createVendorCatalogStore({
    loadBrands: async () => ok(brands),
    loadStores: async () => ok(stores),
    loadWorkspace: async () => ok(workspace),
  });

  await store.getState().loadCatalog();

  store.setState({
    loaders: {
      loadBrands: async () => ok([{ id: "brand-3", name: "Brand Three" }]),
      loadStores: async () => ok([{ id: "store-3", name: "Store Three" }]),
      loadWorkspace: async () => ok(workspace),
    },
  });

  await store.getState().refreshBrands();
  assert.deepEqual(
    store.getState().brands.map((brand) => brand.name),
    ["Brand Three"],
  );
  assert.equal(store.getState().storesById["store-2"].name, "Store Two");

  await store.getState().refreshStores();
  assert.deepEqual(
    store.getState().stores.map((storeRow) => storeRow.name),
    ["Store Three"],
  );
  assert.equal(store.getState().brandsById["brand-3"].name, "Brand Three");
});
