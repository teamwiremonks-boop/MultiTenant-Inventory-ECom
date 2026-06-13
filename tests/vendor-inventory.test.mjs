import assert from "node:assert/strict";
import { test } from "node:test";

import {
  inventoryTotalForStore,
  setVariantInventoryQuantity,
  variantOptionText,
} from "../lib/vendor-inventory.mjs";

test("variantOptionText shows option names and values instead of raw SKU", () => {
  assert.equal(
    variantOptionText({ Color: "Black", Size: "M" }),
    "Color: Black / Size: M",
  );
  assert.equal(variantOptionText({}), "Default");
});

test("setVariantInventoryQuantity updates only the selected variant and store", () => {
  const product = {
    id: "product-1",
    variants: [
      {
        id: "variant-1",
        inventory: [
          { storeId: "store-1", quantity: 2 },
          { storeId: "store-2", quantity: 8 },
        ],
      },
      {
        id: "variant-2",
        inventory: [{ storeId: "store-1", quantity: 4 }],
      },
    ],
  };

  const next = setVariantInventoryQuantity(product, {
    quantity: 12,
    storeId: "store-1",
    variantId: "variant-1",
  });

  assert.equal(next.variants[0].inventory[0].quantity, 12);
  assert.equal(next.variants[0].inventory[1].quantity, 8);
  assert.equal(next.variants[1].inventory[0].quantity, 4);
  assert.equal(product.variants[0].inventory[0].quantity, 2);
});

test("setVariantInventoryQuantity adds a missing store inventory row", () => {
  const next = setVariantInventoryQuantity(
    {
      variants: [{ id: "variant-1", inventory: [] }],
    },
    {
      quantity: 7,
      storeId: "store-3",
      variantId: "variant-1",
    },
  );

  assert.deepEqual(next.variants[0].inventory, [
    { storeId: "store-3", quantity: 7 },
  ]);
});

test("inventoryTotalForStore totals all variant quantities for one store", () => {
  assert.equal(
    inventoryTotalForStore(
      {
        variants: [
          {
            inventory: [
              { storeId: "store-1", quantity: 2 },
              { storeId: "store-2", quantity: 5 },
            ],
          },
          { inventory: [{ storeId: "store-1", quantity: 3 }] },
        ],
      },
      "store-1",
    ),
    5,
  );
});
