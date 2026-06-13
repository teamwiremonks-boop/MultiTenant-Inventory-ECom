import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildFulfillmentPayload,
  normalizeVendorOrderDetail,
  summarizeVendorOrderRow,
  validateFulfillmentDraft,
} from "../lib/vendor-order-fulfillment.mjs";

test("summarizeVendorOrderRow reports allocation progress for table rows", () => {
  assert.deepEqual(
    summarizeVendorOrderRow({
      id: "vendor-order-1",
      status: "placed",
      items: [
        {
          id: "item-1",
          quantity: 3,
          fulfillments: [
            { quantity: 1, status: "reserved" },
            { quantity: 2, status: "reserved" },
          ],
        },
        { id: "item-2", quantity: 2, fulfillments: [] },
      ],
    }),
    {
      allocatedQuantity: 3,
      fulfillmentLabel: "Needs allocation",
      itemCount: 2,
      orderedQuantity: 5,
      state: "needs_allocation",
    },
  );
});

test("normalizeVendorOrderDetail picks the selected vendor order and its item fulfillments", () => {
  const detail = normalizeVendorOrderDetail(
    {
      order: { id: "order-1", orderNumber: "ORD-1" },
      vendorOrders: [
        {
          id: "vendor-order-1",
          status: "placed",
          items: [
            {
              id: "item-1",
              productName: "T-Shirt",
              quantity: 2,
              fulfillments: [
                {
                  id: "fulfillment-1",
                  storeId: "store-1",
                  storeName: "Main",
                  quantity: 2,
                  status: "reserved",
                },
              ],
            },
          ],
        },
      ],
    },
    "vendor-order-1",
  );

  assert.equal(detail?.order.orderNumber, "ORD-1");
  assert.equal(detail?.vendorOrder.items[0].fulfillments[0].storeName, "Main");
});

test("normalizeVendorOrderDetail keeps vendor-visible delivery contact details", () => {
  const detail = normalizeVendorOrderDetail(
    {
      order: {
        id: "order-1",
        orderNumber: "ORD-1",
        customerEmail: "customer@example.com",
        customerPhone: "+911234567890",
        shippingAddress: {
          recipient: "Customer One",
          line1: "10 Market Road",
          city: "Pune",
          state: "MH",
          phone: "+919876543210",
        },
      },
      vendorOrders: [{ id: "vendor-order-1", items: [] }],
    },
    "vendor-order-1",
  );

  assert.equal(detail?.order.customerEmail, "customer@example.com");
  assert.equal(detail?.order.customerPhone, "+911234567890");
  assert.deepEqual(detail?.order.shippingAddress, {
    recipient: "Customer One",
    line1: "10 Market Road",
    city: "Pune",
    state: "MH",
    phone: "+919876543210",
  });
});

test("validateFulfillmentDraft requires each order item to be fully allocated", () => {
  const result = validateFulfillmentDraft({
    items: [{ id: "item-1", productName: "T-Shirt", quantity: 3, variantId: "variant-1" }],
    inventory: [
      {
        availableQuantity: 5,
        storeId: "store-1",
        storeName: "Main",
        variantId: "variant-1",
      },
    ],
    draft: {
      "item-1": [{ quantity: 2, storeId: "store-1" }],
    },
  });

  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, {
    "item-1": ["Allocate 1 more unit."],
  });
});

test("validateFulfillmentDraft blocks duplicate stores and over-allocation", () => {
  const result = validateFulfillmentDraft({
    items: [{ id: "item-1", productName: "T-Shirt", quantity: 2, variantId: "variant-1" }],
    inventory: [
      {
        availableQuantity: 1,
        storeId: "store-1",
        storeName: "Main",
        variantId: "variant-1",
      },
    ],
    draft: {
      "item-1": [
        { quantity: 1, storeId: "store-1" },
        { quantity: 1, storeId: "store-1" },
      ],
    },
  });

  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, {
    "item-1": ["Use each store only once.", "Main has only 1 available unit."],
  });
});

test("buildFulfillmentPayload flattens the draft for update_vendor_order_status", () => {
  assert.deepEqual(
    buildFulfillmentPayload("vendor-order-1", {
      "item-1": [
        { quantity: 1, storeId: "store-1" },
        { quantity: 2, storeId: "store-2" },
      ],
    }),
    {
      vendorOrderId: "vendor-order-1",
      status: "accepted",
      fulfillments: [
        { orderItemId: "item-1", quantity: 1, storeId: "store-1" },
        { orderItemId: "item-1", quantity: 2, storeId: "store-2" },
      ],
    },
  );
});
