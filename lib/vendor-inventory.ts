import {
  inventoryTotalForStore as inventoryTotalForStoreUntyped,
  setVariantInventoryQuantity as setVariantInventoryQuantityUntyped,
  variantOptionText as variantOptionTextUntyped,
} from "./vendor-inventory.mjs";
import type { ProductValues } from "@/lib/schemas/vendor";

export const variantOptionText = variantOptionTextUntyped as (
  attributes: Record<string, unknown>,
) => string;

export const setVariantInventoryQuantity =
  setVariantInventoryQuantityUntyped as (
    product: ProductValues & { id?: string },
    update: {
      quantity: number;
      storeId: string;
      variantId: string;
    },
  ) => ProductValues & { id?: string };

export const inventoryTotalForStore = inventoryTotalForStoreUntyped as (
  product: ProductValues | null | undefined,
  storeId: string,
) => number;
