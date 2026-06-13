import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildProductMutationPayload,
  generateVariantMatrix,
  productResponseToFormValues,
} from "../lib/product-builder.mjs";

const stores = [
  { id: "store-1", name: "Store 1" },
  { id: "store-2", name: "Store 2" },
];

const storesWithInactive = [
  { id: "store-1", name: "Store 1", is_active: true },
  { id: "store-2", name: "Store 2", is_active: false },
];

test("generateVariantMatrix creates one row for each option combination with store inventory columns", () => {
  const variants = generateVariantMatrix({
    basePrice: 499,
    optionGroups: [
      {
        name: "Size",
        values: [{ value: "S" }, { value: "M" }, { value: "L" }],
      },
      {
        name: "Color",
        values: [{ value: "Black" }],
      },
    ],
    stores,
  });

  assert.deepEqual(
    variants.map((variant) => ({
      label: variant.label,
      sku: variant.sku,
      price: variant.price,
      attributes: variant.attributes,
      inventory: variant.inventory,
    })),
    [
      {
        label: "S / Black",
        sku: "S-BLACK",
        price: 499,
        attributes: { Size: "S", Color: "Black" },
        inventory: [
          { storeId: "store-1", quantity: 0 },
          { storeId: "store-2", quantity: 0 },
        ],
      },
      {
        label: "M / Black",
        sku: "M-BLACK",
        price: 499,
        attributes: { Size: "M", Color: "Black" },
        inventory: [
          { storeId: "store-1", quantity: 0 },
          { storeId: "store-2", quantity: 0 },
        ],
      },
      {
        label: "L / Black",
        sku: "L-BLACK",
        price: 499,
        attributes: { Size: "L", Color: "Black" },
        inventory: [
          { storeId: "store-1", quantity: 0 },
          { storeId: "store-2", quantity: 0 },
        ],
      },
    ],
  );
});

test("generateVariantMatrix preserves matching variant IDs, images, price, SKU, and inventory", () => {
  const variants = generateVariantMatrix({
    basePrice: 499,
    existingVariants: [
      {
        id: "variant-1",
        attributes: { Size: "S", Color: "Black" },
        sku: "TSH-S-BLK",
        price: 549,
        imageUrls: ["https://example.com/s-black.png"],
        inventory: [
          { storeId: "store-1", quantity: 4 },
          { storeId: "store-2", quantity: 12 },
        ],
      },
    ],
    optionGroups: [
      { name: "Size", values: [{ value: "S" }] },
      { name: "Color", values: [{ value: "Black" }] },
    ],
    stores,
  });

  assert.deepEqual(variants[0], {
    id: "variant-1",
    label: "S / Black",
    attributes: { Size: "S", Color: "Black" },
    sku: "TSH-S-BLK",
    price: 549,
    imageUrls: ["https://example.com/s-black.png"],
    isActive: true,
    inventory: [
      { storeId: "store-1", quantity: 4 },
      { storeId: "store-2", quantity: 12 },
    ],
  });
});

test("buildProductMutationPayload maps form state to save_product contract", () => {
  const payload = buildProductMutationPayload({
    brandId: "brand-1",
    basePrice: 499,
    description: "<p>Soft tee</p>",
    id: "product-1",
    isActive: true,
    name: "TShirt",
    productImages: ["https://example.com/default.png"],
    optionGroups: [
      {
        id: "group-1",
        name: "Size",
        sortOrder: 0,
        values: [{ id: "value-1", value: "S", sortOrder: 0 }],
      },
    ],
    variants: [
      {
        id: "variant-1",
        attributes: { Size: "S" },
        sku: "TSH-S",
        price: 499,
        imageUrls: ["https://example.com/s.png"],
        isActive: true,
        inventory: [{ storeId: "store-1", quantity: 10 }],
      },
    ],
  });

  assert.deepEqual(payload, {
    product: {
      id: "product-1",
      brandId: "brand-1",
      name: "TShirt",
      description: "<p>Soft tee</p>",
      basePrice: 499,
      isActive: true,
      productImages: ["https://example.com/default.png"],
      optionGroups: [
        {
          id: "group-1",
          name: "Size",
          sortOrder: 0,
          values: [{ id: "value-1", value: "S", sortOrder: 0 }],
        },
      ],
      variants: [
        {
          id: "variant-1",
          attributes: { Size: "S" },
          sku: "TSH-S",
          price: 499,
          isActive: true,
          imageUrls: ["https://example.com/s.png"],
          inventory: [{ storeId: "store-1", quantity: 10 }],
        },
      ],
    },
  });
});

test("productResponseToFormValues maps backend get_product response into editable form state", () => {
  const values = productResponseToFormValues({
    id: "product-1",
    brandId: "brand-1",
    name: "TShirt",
    description: "<p>Soft tee</p>",
    basePrice: "499",
    productImages: ["https://example.com/default.png"],
    optionGroups: [
      {
        id: "group-1",
        name: "Size",
        sortOrder: 0,
        values: [{ id: "value-1", value: "S", sortOrder: 0 }],
      },
    ],
    variants: [
      {
        id: "variant-1",
        attributes: { Size: "S" },
        sku: "TSH-S",
        price: "499",
        images: ["https://example.com/s.png"],
        inventory: [{ storeId: "store-1", quantity: 10 }],
      },
    ],
  });

  assert.equal(values.basePrice, 499);
  assert.equal(values.variants[0].price, 499);
  assert.deepEqual(values.variants[0].imageUrls, ["https://example.com/s.png"]);
});

test("productResponseToFormValues accepts snake_case product response aliases", () => {
  const values = productResponseToFormValues({
    id: "product-1",
    brand_id: "brand-1",
    is_active: false,
    name: "TShirt",
    base_price: "499",
    product_images: ["https://example.com/default.png"],
    option_groups: [
      {
        id: "group-1",
        name: "Size",
        sort_order: 0,
        values: [{ id: "value-1", value: "S", sort_order: 0 }],
      },
    ],
    variants: [
      {
        id: "variant-1",
        is_active: false,
        attributes: { Size: "S" },
        sku: "TSH-S",
        price: "499",
        image_urls: ["https://example.com/s.png"],
        variant_inventory: [
          { store_id: "store-1", quantity: "10" },
          { storeId: "store-2", quantity: 4 },
        ],
      },
    ],
  });

  assert.equal(values.brandId, "brand-1");
  assert.equal(values.isActive, false);
  assert.equal(values.basePrice, 499);
  assert.deepEqual(values.productImages, ["https://example.com/default.png"]);
  assert.deepEqual(values.optionGroups[0], {
    id: "group-1",
    name: "Size",
    sortOrder: 0,
    values: [{ id: "value-1", value: "S", sortOrder: 0 }],
  });
  assert.deepEqual(values.variants[0].imageUrls, ["https://example.com/s.png"]);
  assert.equal(values.variants[0].isActive, false);
  assert.deepEqual(values.variants[0].inventory, [
    { storeId: "store-1", quantity: 10 },
    { storeId: "store-2", quantity: 4 },
  ]);
});

test("generateVariantMatrix does not wipe edit inventory when stores are not loaded yet", () => {
  const existingVariants = [
    {
      id: "variant-1",
      attributes: { Size: "S" },
      sku: "TSH-S",
      price: 499,
      imageUrls: [],
      isActive: true,
      inventory: [{ storeId: "store-1", quantity: 10 }],
    },
  ];

  const variants = generateVariantMatrix({
    basePrice: 499,
    existingVariants,
    optionGroups: [{ name: "Size", values: [{ value: "S" }] }],
    stores: [],
  });

  assert.deepEqual(variants[0].inventory, [
    { storeId: "store-1", quantity: 10 },
  ]);
});

test("generateVariantMatrix preserves inactive store inventory for vendor read-only edit", () => {
  const variants = generateVariantMatrix({
    basePrice: 499,
    existingVariants: [
      {
        id: "variant-1",
        attributes: { Size: "S" },
        sku: "TSH-S",
        price: 499,
        imageUrls: [],
        isActive: true,
        inventory: [
          { storeId: "store-1", quantity: 10 },
          { storeId: "store-2", quantity: 100 },
        ],
      },
    ],
    optionGroups: [{ name: "Size", values: [{ value: "S" }] }],
    stores: storesWithInactive,
  });

  assert.deepEqual(variants[0].inventory, [
    { storeId: "store-1", quantity: 10 },
    { storeId: "store-2", quantity: 100 },
  ]);
});
