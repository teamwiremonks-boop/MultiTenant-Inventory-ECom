import assert from "node:assert/strict";
import { test } from "node:test";

import {
  brandRowToFormValues,
  storeRowToFormValues,
} from "../lib/vendor-edit-mappers.mjs";

test("brandRowToFormValues maps Supabase brand fields into the brand form", () => {
  const formValues = brandRowToFormValues({
    id: "brand-1",
    name: "Vendor Brand",
    description: "Seasonal collection",
    logo_urls: ["https://example.com/logo.png"],
    is_active: false,
  });

  assert.deepEqual(formValues, {
    id: "brand-1",
    name: "Vendor Brand",
    description: "Seasonal collection",
    logoUrls: ["https://example.com/logo.png"],
    isActive: false,
  });
});

test("storeRowToFormValues maps Supabase store fields into the store form", () => {
  const formValues = storeRowToFormValues({
    id: "store-1",
    name: "Main Store",
    address: "221B Baker Street",
    image_urls: ["https://example.com/store.png"],
    is_active: false,
  });

  assert.deepEqual(formValues, {
    id: "store-1",
    name: "Main Store",
    address: "221B Baker Street",
    imageUrls: ["https://example.com/store.png"],
    is_active: false,
  });
});

test("storeRowToFormValues falls back to legacy location fields", () => {
  const formValues = storeRowToFormValues({
    id: "store-2",
    name: "Pickup Point",
    address_line1: "MG Road",
    city: "Bengaluru",
    state: "KA",
  });

  assert.equal(formValues.address, "MG Road, Bengaluru, KA");
  assert.equal(formValues.is_active, true);
});
