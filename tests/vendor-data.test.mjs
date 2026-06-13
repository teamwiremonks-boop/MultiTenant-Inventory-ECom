import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isVendorBrandActive,
  statusLabel,
  vendorBrandOptionLabel,
} from "../lib/vendor-data.mjs";

test("isVendorBrandActive treats active camelCase and snake_case brands as selectable", () => {
  assert.equal(isVendorBrandActive({ id: "brand-1", isActive: true }), true);
  assert.equal(isVendorBrandActive({ id: "brand-2", is_active: true }), true);
});

test("isVendorBrandActive treats inactive camelCase and snake_case brands as disabled", () => {
  assert.equal(isVendorBrandActive({ id: "brand-1", isActive: false }), false);
  assert.equal(isVendorBrandActive({ id: "brand-2", is_active: false }), false);
});

test("vendorBrandOptionLabel marks inactive brands for the product dropdown", () => {
  assert.equal(
    vendorBrandOptionLabel({ id: "brand-1", name: "Old Brand", isActive: false }),
    "Old Brand (inactive)",
  );
  assert.equal(
    vendorBrandOptionLabel({ id: "brand-2", name: "Live Brand", isActive: true }),
    "Live Brand",
  );
});

test("statusLabel reads camelCase and snake_case active flags", () => {
  assert.equal(statusLabel({ isActive: false }), "inactive");
  assert.equal(statusLabel({ is_active: false }), "inactive");
  assert.equal(statusLabel({ isActive: true }), "active");
  assert.equal(statusLabel({ platform_status: "suspended", isActive: true }), "suspended");
});
