import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isVendorNavItemActive,
  visibleVendorNavItems,
} from "../lib/vendor-navigation.mjs";

const items = [
  { href: "/vendor/dashboard", label: "Dashboard" },
  { href: "/vendor/products", label: "Products" },
  { href: "/vendor/reactivation", label: "Reactivation", requiresSuspension: true },
];

test("visibleVendorNavItems hides reactivation unless vendor is suspended", () => {
  assert.deepEqual(
    visibleVendorNavItems(items, { isSuspended: false }).map((item) => item.label),
    ["Dashboard", "Products"],
  );
  assert.deepEqual(
    visibleVendorNavItems(items, { isSuspended: true }).map((item) => item.label),
    ["Dashboard", "Products", "Reactivation"],
  );
});

test("isVendorNavItemActive matches exact routes and nested descendants", () => {
  assert.equal(isVendorNavItemActive("/vendor/products", "/vendor/products"), true);
  assert.equal(
    isVendorNavItemActive("/vendor/products", "/vendor/products/new"),
    true,
  );
  assert.equal(
    isVendorNavItemActive("/vendor/products", "/vendor/productivity"),
    false,
  );
});
