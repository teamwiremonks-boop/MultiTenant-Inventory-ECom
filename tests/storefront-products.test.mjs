import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildCheckoutPayload,
  effectiveProductImages,
  firstAvailableVariant,
  isOptionValueAvailable,
  lowestPricedAvailableVariant,
  productBentoLayout,
  productDetailToCartItem,
  publicProductToCard,
  resolveVariantFromOptions,
  sanitizeProductDescription,
  variantOptionGroups,
} from "../lib/storefront-products.mjs";

test("publicProductToCard normalizes public catalog rows", () => {
  assert.deepEqual(
    publicProductToCard({
      id: "product-1",
      brandName: "Acme",
      name: "Canvas tote",
      basePrice: "499",
      productImages: ["https://example.com/tote.png"],
      available: true,
      variantCount: "2",
      variants: [
        {
          id: "variant-1",
          attributes: { Size: "M" },
          sku: "TOTE-M",
          price: "549",
          available: true,
          images: ["https://example.com/tote-m.png"],
        },
      ],
    }),
    {
      id: "product-1",
      brandName: "Acme",
      name: "Canvas tote",
      description: "",
      basePrice: 499,
      imageUrl: "https://example.com/tote.png",
      imageUrls: ["https://example.com/tote.png"],
      available: true,
      variantCount: 2,
      variants: [
        {
          id: "variant-1",
          attributes: { Size: "M" },
          sku: "TOTE-M",
          price: 549,
          available: true,
          imageUrl: "https://example.com/tote-m.png",
          imageUrls: ["https://example.com/tote-m.png"],
        },
      ],
    },
  );
});

test("effectiveProductImages prefers selected SKU images and normalizes to five", () => {
  assert.deepEqual(
    effectiveProductImages(
      ["default-1.jpg", "default-2.jpg"],
      {
        imageUrls: [
          "sku-1.jpg",
          "",
          "sku-1.jpg",
          "sku-2.jpg",
          "sku-3.jpg",
          "sku-4.jpg",
          "sku-5.jpg",
          "sku-6.jpg",
          null,
        ],
      },
    ),
    ["sku-1.jpg", "sku-2.jpg", "sku-3.jpg", "sku-4.jpg", "sku-5.jpg"],
  );
});

test("effectiveProductImages falls back to normalized product images", () => {
  assert.deepEqual(
    effectiveProductImages(
      ["default-1.jpg", "default-1.jpg", "", "default-2.jpg"],
      { imageUrls: [] },
    ),
    ["default-1.jpg", "default-2.jpg"],
  );
});

test("sanitizeProductDescription keeps safe formatting and removes unsafe markup", () => {
  const description = sanitizeProductDescription(`
    <p onclick="alert('x')">A <strong>useful</strong> description.</p>
    <a href="javascript:alert('x')">Unsafe link</a>
    <a href="https://example.com">Safe link</a>
    <script>alert('x')</script>
    <iframe src="https://example.com"></iframe>
  `);

  assert.match(description, /<p>A <strong>useful<\/strong> description\.<\/p>/);
  assert.match(description, /href="https:\/\/example\.com"/);
  assert.doesNotMatch(description, /onclick|javascript:|<script|<iframe/i);
});

test("sanitizeProductDescription makes card descriptions non-interactive", () => {
  const description = sanitizeProductDescription(
    '<p>Read the <a href="https://example.com">details</a>.</p>',
    { links: false },
  );

  assert.doesNotMatch(description, /<a\b/i);
  assert.match(description, /details/);
});

test("productBentoLayout describes approved layouts up to five images", () => {
  assert.deepEqual(productBentoLayout(0), []);
  assert.deepEqual(productBentoLayout(1), [[1]]);
  assert.deepEqual(productBentoLayout(2), [[1, 1]]);
  assert.deepEqual(productBentoLayout(3), [[1], [1, 1]]);
  assert.deepEqual(productBentoLayout(4), [[1, 1], [1, 1]]);
  assert.deepEqual(productBentoLayout(5), [[3, 2], [1, 1, 1]]);
  assert.deepEqual(productBentoLayout(8), [[3, 2], [1, 1, 1]]);
});

test("firstAvailableVariant prefers available variants and skips inactive rows", () => {
  assert.deepEqual(
    firstAvailableVariant({
      variants: [
        { id: "variant-1", available: false, isActive: true },
        { id: "variant-2", available: true, isActive: true },
      ],
    }),
    { id: "variant-2", available: true, isActive: true },
  );
});

test("lowestPricedAvailableVariant selects the cheapest available SKU", () => {
  assert.deepEqual(
    lowestPricedAvailableVariant({
      variants: [
        { id: "variant-1", price: 799, available: true },
        { id: "variant-2", price: 499, available: true },
        { id: "variant-3", price: 299, available: false },
      ],
    }),
    { id: "variant-2", price: 499, available: true },
  );
});

test("variantOptionGroups builds selectable option values with availability", () => {
  assert.deepEqual(
    variantOptionGroups([
      {
        id: "variant-1",
        attributes: { Size: "M", Color: "Black" },
        available: true,
      },
      {
        id: "variant-2",
        attributes: { Size: "L", Color: "Black" },
        available: false,
      },
    ]),
    [
      {
        name: "Size",
        values: [
          { available: true, value: "M" },
          { available: false, value: "L" },
        ],
      },
      {
        name: "Color",
        values: [{ available: true, value: "Black" }],
      },
    ],
  );
});

test("resolveVariantFromOptions finds the variant matching selected option values", () => {
  assert.deepEqual(
    resolveVariantFromOptions(
      [
        { id: "variant-1", attributes: { Size: "M", Color: "Black" } },
        { id: "variant-2", attributes: { Size: "L", Color: "Black" } },
      ],
      { Size: "L", Color: "Black" },
    ),
    { id: "variant-2", attributes: { Size: "L", Color: "Black" } },
  );
});

test("isOptionValueAvailable checks the candidate against selections in other groups", () => {
  const variants = [
    {
      id: "variant-1",
      attributes: { Size: "M", Color: "Black" },
      available: true,
    },
    {
      id: "variant-2",
      attributes: { Size: "L", Color: "Black" },
      available: false,
    },
    {
      id: "variant-3",
      attributes: { Size: "L", Color: "Red" },
      available: true,
    },
  ];

  assert.equal(
    isOptionValueAvailable(
      variants,
      { Size: "M", Color: "Black" },
      "Size",
      "L",
    ),
    false,
  );
  assert.equal(
    isOptionValueAvailable(
      variants,
      { Size: "L", Color: "Black" },
      "Color",
      "Red",
    ),
    true,
  );
});

test("productDetailToCartItem maps the product detail response to cart state", () => {
  const item = productDetailToCartItem({
    id: "product-1",
    name: "Canvas tote",
    brandName: "Acme",
    basePrice: "499",
    productImages: ["https://example.com/product.png"],
    variants: [
      {
        id: "variant-1",
        attributes: { Size: "M", Color: "Black" },
        sku: "TOTE-M-BLK",
        price: "549",
        available: true,
        images: ["https://example.com/variant.png"],
      },
    ],
  });

  assert.equal(item?.variantId, "variant-1");
  assert.equal(item?.variantLabel, "Size: M / Color: Black");
  assert.equal(item?.price, 549);
  assert.equal(item?.imageUrl, "https://example.com/variant.png");
});

test("buildCheckoutPayload matches the place_order RPC contract", () => {
  assert.deepEqual(
    buildCheckoutPayload({
      items: [
        { variantId: "variant-1", quantity: 2 },
        { variantId: "variant-2", quantity: 1 },
      ],
      customer: {
        fullName: "Mina Rao",
        phone: "5550100",
      },
      shippingAddress: {
        recipient: "Mina Rao",
        phone: "5550100",
        line1: "42 Market Road",
        city: "Pune",
        state: "MH",
        postalCode: "411001",
      },
    }),
    {
      items: [
        { variantId: "variant-1", quantity: 2 },
        { variantId: "variant-2", quantity: 1 },
      ],
      customer: {
        fullName: "Mina Rao",
        phone: "5550100",
      },
      shippingAddress: {
        recipient: "Mina Rao",
        phone: "5550100",
        line1: "42 Market Road",
        city: "Pune",
        state: "MH",
        postalCode: "411001",
      },
    },
  );
});
