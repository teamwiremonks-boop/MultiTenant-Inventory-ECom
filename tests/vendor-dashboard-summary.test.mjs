import assert from "node:assert/strict";
import { test } from "node:test";

import {
  summarizeVendorDashboard,
  summarizeVendorOrders,
} from "../lib/vendor-dashboard-summary.mjs";

test("summarizeVendorDashboard counts active and inactive catalog records", () => {
  const summary = summarizeVendorDashboard({
    brands: [
      { id: "brand-1", isActive: true },
      { id: "brand-2", isActive: false },
    ],
    products: [
      { id: "product-1", isActive: true },
      { id: "product-2", isActive: false },
      { id: "product-3", isActive: true, platform_status: "suspended" },
    ],
    stores: [
      { id: "store-1", is_active: true },
      { id: "store-2", is_active: false },
    ],
  });

  assert.deepEqual(summary, {
    brands: { active: 1, inactive: 1, total: 2 },
    products: { active: 1, inactive: 1, suspended: 1, total: 3 },
    stores: { active: 1, inactive: 1, total: 2 },
  });
});

test("summarizeVendorOrders counts total and open fulfillment work", () => {
  const summary = summarizeVendorOrders([
    { id: "order-1", status: "placed" },
    { id: "order-2", status: "accepted" },
    { id: "order-3", status: "shipped" },
    { id: "order-4", status: "delivered" },
    { id: "order-5", status: "canceled" },
  ]);

  assert.deepEqual(summary, {
    total: 5,
    open: 3,
    byStatus: {
      accepted: 1,
      canceled: 1,
      delivered: 1,
      placed: 1,
      shipped: 1,
    },
  });
});
