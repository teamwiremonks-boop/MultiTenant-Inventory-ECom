"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/actions/_shared/auth";
import { getServerSupabaseClient } from "@/lib/actions/_shared/auth";
import { callRpc } from "@/lib/actions/_shared/rpc";
import { fail, ok } from "@/lib/actions/_shared/results";
import { unwrapPayload } from "@/lib/actions/_shared/validation";
import { normalizeVendorOrderDetail } from "@/lib/vendor-order-fulfillment.mjs";

export async function trackVendorOrder(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  return callRpc("track_order", payload.data);
}

export async function updateVendorOrderStatus(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("update_vendor_order_status", payload.data);
  if (result.ok) {
    revalidatePath("/vendor/orders");
    revalidatePath(`/vendor/orders/${payload.data.vendorOrderId ?? payload.data.id ?? ""}`);
    revalidatePath("/orders");
  }

  return result;
}

export async function listVendorOrders() {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const supabase = await getServerSupabaseClient();
  const vendorId = await getCurrentVendorId(supabase, user.data.id);
  if (!vendorId.ok) return vendorId;

  if (!vendorId.data) {
    return ok([]);
  }

  const { data, error } = await supabase
    .from("vendor_orders")
    .select("id, order_id, vendor_id, status, subtotal, vendor_note, created_at, updated_at")
    .eq("vendor_id", vendorId.data)
    .order("created_at", { ascending: false });

  if (error) {
    return fail(error.code ?? "VENDOR_ORDERS_ERROR", error.message, error.details);
  }

  const vendorOrders = data ?? [];
  if (vendorOrders.length === 0) {
    return ok([]);
  }

  const vendorOrderIds = vendorOrders.map((order) => order.id);
  const orderIds = vendorOrders.map((order) => order.order_id);

  const [ordersResult, itemsResult] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, status, shipping_address, created_at, updated_at")
      .in("id", orderIds),
    supabase
      .from("order_items")
      .select("id, vendor_order_id, variant_id, product_name, variant_attributes, sku, quantity, status, created_at")
      .in("vendor_order_id", vendorOrderIds),
  ]);

  if (ordersResult.error) {
    return fail(
      ordersResult.error.code ?? "ORDERS_ERROR",
      ordersResult.error.message,
      ordersResult.error.details,
    );
  }

  if (itemsResult.error) {
    return fail(
      itemsResult.error.code ?? "ORDER_ITEMS_ERROR",
      itemsResult.error.message,
      itemsResult.error.details,
    );
  }

  const items = itemsResult.data ?? [];
  const itemIds = items.map((item) => item.id);
  const fulfillmentResult =
    itemIds.length > 0
      ? await supabase
          .from("order_item_fulfillments")
          .select("id, order_item_id, store_id, quantity, status, created_at, updated_at")
          .in("order_item_id", itemIds)
      : { data: [], error: null };

  if (fulfillmentResult.error) {
    return fail(
      fulfillmentResult.error.code ?? "FULFILLMENTS_ERROR",
      fulfillmentResult.error.message,
      fulfillmentResult.error.details,
    );
  }

  const storeIds = [
    ...new Set((fulfillmentResult.data ?? []).map((row) => row.store_id)),
  ].filter(Boolean);
  const storeResult =
    storeIds.length > 0
      ? await supabase.from("stores").select("id, name").in("id", storeIds)
      : { data: [], error: null };

  if (storeResult.error) {
    return fail(
      storeResult.error.code ?? "STORES_ERROR",
      storeResult.error.message,
      storeResult.error.details,
    );
  }

  const ordersById = new Map((ordersResult.data ?? []).map((row) => [row.id, row]));
  const storesById = new Map((storeResult.data ?? []).map((row) => [row.id, row]));
  const fulfillmentsByItemId = new Map<string, Array<Record<string, unknown>>>();
  for (const fulfillment of fulfillmentResult.data ?? []) {
    const current = fulfillmentsByItemId.get(fulfillment.order_item_id) ?? [];
    current.push({
      id: fulfillment.id,
      quantity: fulfillment.quantity,
      status: fulfillment.status,
      storeId: fulfillment.store_id,
      storeName: storesById.get(fulfillment.store_id)?.name ?? "Store",
    });
    fulfillmentsByItemId.set(fulfillment.order_item_id, current);
  }

  const itemsByVendorOrderId = new Map<string, Array<Record<string, unknown>>>();
  for (const item of items) {
    const current = itemsByVendorOrderId.get(item.vendor_order_id) ?? [];
    current.push({
      id: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      sku: item.sku,
      status: item.status,
      variantAttributes: item.variant_attributes,
      variantId: item.variant_id,
      fulfillments: fulfillmentsByItemId.get(item.id) ?? [],
    });
    itemsByVendorOrderId.set(item.vendor_order_id, current);
  }

  return ok(
    vendorOrders.map((order) => {
      const parentOrder = ordersById.get(order.order_id);
      return {
        ...order,
        orderNumber: parentOrder?.order_number ?? order.order_id,
        orderStatus: parentOrder?.status ?? "",
        shippingAddress: parentOrder?.shipping_address ?? null,
        items: itemsByVendorOrderId.get(order.id) ?? [],
      };
    }),
  );
}

export async function getVendorOrder(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const vendorOrderId =
    typeof payload.data.vendorOrderId === "string"
      ? payload.data.vendorOrderId
      : typeof payload.data.id === "string"
        ? payload.data.id
        : "";

  if (!vendorOrderId) {
    return fail("INVALID_VENDOR_ORDER", "vendorOrderId is required.");
  }

  const supabase = await getServerSupabaseClient();
  const vendorId = await getCurrentVendorId(supabase, user.data.id);
  if (!vendorId.ok) return vendorId;

  if (!vendorId.data) {
    return fail("VENDOR_WORKSPACE_REQUIRED", "Vendor workspace was not found.");
  }

  const { data, error } = await supabase
    .from("vendor_orders")
    .select("id, order_id, vendor_id, status, subtotal, vendor_note, created_at, updated_at")
    .eq("id", vendorOrderId)
    .eq("vendor_id", vendorId.data)
    .maybeSingle();

  if (error) {
    return fail(error.code ?? "VENDOR_ORDER_ERROR", error.message, error.details);
  }

  if (!data) {
    return fail("VENDOR_ORDER_NOT_FOUND", "Vendor order was not found for this vendor.");
  }

  const tracked = await callRpc("track_order", { orderId: data.order_id });
  if (!tracked.ok) return tracked;

  return ok({
    detail: normalizeVendorOrderDetail(tracked.data, vendorOrderId),
    vendorOrder: data,
    tracking: tracked.data,
  });
}

export async function getVendorOrderInventory(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const order = await getVendorOrder(input);
  if (!order.ok) return order;

  const detail = order.data.detail as
    | {
        vendorOrder?: {
          items?: Array<{ variantId?: string }>;
        };
      }
    | null
    | undefined;
  const variantIds = [
    ...new Set(
      (detail?.vendorOrder?.items ?? [])
        .map((item) => item.variantId)
        .filter((variantId): variantId is string => Boolean(variantId)),
    ),
  ];

  if (variantIds.length === 0) {
    return ok([]);
  }

  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("variant_inventory")
    .select("variant_id, store_id, quantity, reserved_quantity")
    .in("variant_id", variantIds);

  if (error) {
    return fail(error.code ?? "INVENTORY_ERROR", error.message, error.details);
  }

  const storeIds = [...new Set((data ?? []).map((row) => row.store_id))];
  const storeResult =
    storeIds.length > 0
      ? await supabase
          .from("stores")
          .select("id, name, is_active")
          .in("id", storeIds)
      : { data: [], error: null };

  if (storeResult.error) {
    return fail(
      storeResult.error.code ?? "STORES_ERROR",
      storeResult.error.message,
      storeResult.error.details,
    );
  }

  const storesById = new Map((storeResult.data ?? []).map((store) => [store.id, store]));

  return ok(
    (data ?? []).map((row) => {
      const store = storesById.get(row.store_id);
      return {
        availableQuantity: Number(row.quantity ?? 0) - Number(row.reserved_quantity ?? 0),
        isActive: store?.is_active !== false,
        quantity: Number(row.quantity ?? 0),
        reservedQuantity: Number(row.reserved_quantity ?? 0),
        storeId: row.store_id,
        storeName: store?.name ?? "Store",
        variantId: row.variant_id,
      };
    }),
  );
}

async function getCurrentVendorId(
  supabase: Awaited<ReturnType<typeof getServerSupabaseClient>>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("vendor_members")
    .select("vendor_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    return fail(error.code ?? "VENDOR_MEMBERSHIP_ERROR", error.message, error.details);
  }

  return ok(typeof data?.vendor_id === "string" ? data.vendor_id : null);
}
