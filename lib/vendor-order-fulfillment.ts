import {
  buildFulfillmentPayload as buildFulfillmentPayloadUntyped,
  formatVariantAttributes as formatVariantAttributesUntyped,
  initialFulfillmentDraft as initialFulfillmentDraftUntyped,
  normalizeVendorOrder as normalizeVendorOrderUntyped,
  normalizeVendorOrderDetail as normalizeVendorOrderDetailUntyped,
  summarizeVendorOrderRow as summarizeVendorOrderRowUntyped,
  validateFulfillmentDraft as validateFulfillmentDraftUntyped,
} from "./vendor-order-fulfillment.mjs";

export type VendorOrderFulfillment = {
  id: string;
  storeId: string;
  storeName: string;
  quantity: number;
  status: string;
};

export type VendorOrderItem = {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantAttributes: Record<string, unknown>;
  sku: string;
  quantity: number;
  status: string;
  fulfillments: VendorOrderFulfillment[];
};

export type VendorOrderDetail = {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: unknown;
    createdAt: unknown;
    updatedAt: unknown;
  };
  vendorOrder: VendorOrder;
};

export type VendorOrder = {
  id: string;
  orderId: string;
  status: string;
  subtotal: number;
  createdAt: unknown;
  updatedAt: unknown;
  items: VendorOrderItem[];
  events: unknown[];
};

export type FulfillmentDraft = Record<
  string,
  Array<{
    quantity: number;
    storeId: string;
  }>
>;

export type FulfillmentInventoryRow = {
  availableQuantity: number;
  isActive?: boolean;
  quantity?: number;
  reservedQuantity?: number;
  storeId: string;
  storeName: string;
  variantId: string;
};

export type FulfillmentValidation = {
  errors: Record<string, string[]>;
  valid: boolean;
};

export const buildFulfillmentPayload = buildFulfillmentPayloadUntyped as (
  vendorOrderId: string,
  draft: FulfillmentDraft,
) => {
  fulfillments: Array<{
    orderItemId: string;
    quantity: number;
    storeId: string;
  }>;
  status: "accepted";
  vendorOrderId: string;
};

export const formatVariantAttributes = formatVariantAttributesUntyped as (
  attributes: Record<string, unknown>,
) => string;

export const initialFulfillmentDraft = initialFulfillmentDraftUntyped as (
  items: VendorOrderItem[],
) => FulfillmentDraft;

export const normalizeVendorOrder = normalizeVendorOrderUntyped as (
  order: unknown,
) => VendorOrder;

export const normalizeVendorOrderDetail = normalizeVendorOrderDetailUntyped as (
  tracking: unknown,
  vendorOrderId: string,
) => VendorOrderDetail | null;

export const summarizeVendorOrderRow = summarizeVendorOrderRowUntyped as (
  order: unknown,
) => {
  allocatedQuantity: number;
  fulfillmentLabel: string;
  itemCount: number;
  orderedQuantity: number;
  state: "complete" | "needs_allocation" | "ready";
};

export const validateFulfillmentDraft = validateFulfillmentDraftUntyped as (input: {
  draft: FulfillmentDraft;
  inventory: FulfillmentInventoryRow[];
  items: VendorOrderItem[];
}) => FulfillmentValidation;
