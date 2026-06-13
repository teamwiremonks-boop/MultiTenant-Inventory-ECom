function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function summarizeVendorOrderRow(order) {
  const items = asArray(order?.items);
  let orderedQuantity = 0;
  let allocatedQuantity = 0;

  for (const item of items) {
    orderedQuantity += asNumber(item?.quantity);
    allocatedQuantity += asArray(item?.fulfillments)
      .filter((fulfillment) => fulfillment?.status !== "canceled")
      .reduce((total, fulfillment) => total + asNumber(fulfillment?.quantity), 0);
  }

  const state =
    order?.status !== "placed"
      ? "complete"
      : allocatedQuantity >= orderedQuantity && orderedQuantity > 0
        ? "ready"
        : "needs_allocation";

  return {
    allocatedQuantity,
    fulfillmentLabel:
      state === "ready"
        ? "Ready to accept"
        : state === "complete"
          ? "Locked"
          : "Needs allocation",
    itemCount: items.length,
    orderedQuantity,
    state,
  };
}

export function normalizeVendorOrderDetail(tracking, vendorOrderId) {
  const vendorOrder = asArray(tracking?.vendorOrders).find(
    (order) => order?.id === vendorOrderId,
  );

  if (!vendorOrder) return null;

  return {
    order: {
      id: asString(tracking?.order?.id),
      orderNumber: asString(tracking?.order?.orderNumber),
      status: asString(tracking?.order?.status),
      customerEmail: asString(tracking?.order?.customerEmail),
      customerPhone: asString(tracking?.order?.customerPhone),
      shippingAddress: tracking?.order?.shippingAddress ?? null,
      createdAt: tracking?.order?.createdAt ?? null,
      updatedAt: tracking?.order?.updatedAt ?? null,
    },
    vendorOrder: normalizeVendorOrder(vendorOrder),
  };
}

export function normalizeVendorOrder(order) {
  return {
    id: asString(order?.id),
    orderId: asString(order?.orderId ?? order?.order_id),
    status: asString(order?.status, "placed"),
    subtotal: asNumber(order?.subtotal),
    createdAt: order?.createdAt ?? order?.created_at ?? null,
    updatedAt: order?.updatedAt ?? order?.updated_at ?? null,
    items: asArray(order?.items).map(normalizeOrderItem),
    events: asArray(order?.events),
  };
}

function normalizeOrderItem(item) {
  return {
    id: asString(item?.id),
    productId: asString(item?.productId ?? item?.product_id),
    variantId: asString(item?.variantId ?? item?.variant_id),
    productName: asString(item?.productName ?? item?.product_name, "Product"),
    variantAttributes: item?.variantAttributes ?? item?.variant_attributes ?? {},
    sku: asString(item?.sku, "-"),
    quantity: asNumber(item?.quantity),
    status: asString(item?.status, "placed"),
    fulfillments: asArray(item?.fulfillments).map((fulfillment) => ({
      id: asString(fulfillment?.id),
      storeId: asString(fulfillment?.storeId ?? fulfillment?.store_id),
      storeName: asString(fulfillment?.storeName ?? fulfillment?.store_name, "Store"),
      quantity: asNumber(fulfillment?.quantity),
      status: asString(fulfillment?.status, "reserved"),
    })),
  };
}

export function initialFulfillmentDraft(items) {
  return Object.fromEntries(
    asArray(items).map((item) => [
      item.id,
      asArray(item.fulfillments)
        .filter((fulfillment) => fulfillment.status !== "canceled")
        .map((fulfillment) => ({
          quantity: fulfillment.quantity,
          storeId: fulfillment.storeId,
        })),
    ]),
  );
}

export function validateFulfillmentDraft({ draft, inventory, items }) {
  const inventoryByStoreAndVariant = new Map(
    asArray(inventory).map((row) => [
      `${row.variantId}:${row.storeId}`,
      row,
    ]),
  );
  const errors = {};

  for (const item of asArray(items)) {
    const allocations = asArray(draft?.[item.id]);
    const itemErrors = [];
    const allocated = allocations.reduce(
      (total, allocation) => total + asNumber(allocation.quantity),
      0,
    );
    const seenStores = new Set();
    const quantityByStore = new Map();

    for (const allocation of allocations) {
      if (!allocation.storeId) {
        itemErrors.push("Select a store.");
        continue;
      }

      if (seenStores.has(allocation.storeId)) {
        itemErrors.push("Use each store only once.");
      }
      seenStores.add(allocation.storeId);

      if (asNumber(allocation.quantity) <= 0) {
        itemErrors.push("Quantity must be greater than zero.");
      }

      quantityByStore.set(
        allocation.storeId,
        (quantityByStore.get(allocation.storeId) ?? 0) +
          asNumber(allocation.quantity),
      );
    }

    for (const [storeId, quantity] of quantityByStore.entries()) {
      const stock = inventoryByStoreAndVariant.get(
        `${item.variantId}:${storeId}`,
      );
      const currentReservedForItem = asArray(item.fulfillments)
        .filter(
          (fulfillment) =>
            fulfillment.storeId === storeId &&
            fulfillment.status === "reserved",
        )
        .reduce((total, fulfillment) => total + asNumber(fulfillment.quantity), 0);
      const available = asNumber(stock?.availableQuantity) + currentReservedForItem;
      if (stock && quantity > available) {
        itemErrors.push(
          `${stock.storeName} has only ${available} available unit${available === 1 ? "" : "s"}.`,
        );
      }
    }

    if (allocated < item.quantity) {
      itemErrors.push(`Allocate ${item.quantity - allocated} more unit${item.quantity - allocated === 1 ? "" : "s"}.`);
    } else if (allocated > item.quantity) {
      itemErrors.push(`Reduce allocation by ${allocated - item.quantity} unit${allocated - item.quantity === 1 ? "" : "s"}.`);
    }

    const uniqueErrors = [...new Set(itemErrors)];
    if (uniqueErrors.length > 0) {
      errors[item.id] = uniqueErrors;
    }
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
}

export function buildFulfillmentPayload(vendorOrderId, draft) {
  return {
    vendorOrderId,
    status: "accepted",
    fulfillments: Object.entries(draft ?? {}).flatMap(([orderItemId, rows]) =>
      asArray(rows).map((row) => ({
        orderItemId,
        quantity: asNumber(row.quantity),
        storeId: row.storeId,
      })),
    ),
  };
}

export function formatVariantAttributes(attributes) {
  const entries = Object.entries(attributes ?? {});
  if (entries.length === 0) return "Default";
  return entries.map(([key, value]) => `${key}: ${value}`).join(" / ");
}
