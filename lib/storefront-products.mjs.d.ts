export type StorefrontProductCard = {
  id: string;
  brandName: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  available: boolean;
  variantCount: number;
  variants: StorefrontProductVariant[];
};

export type StorefrontCartItem = {
  productId: string;
  variantId: string;
  name: string;
  brandName: string;
  variantLabel: string;
  sku: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export type StorefrontProductVariant = {
  id: string;
  attributes: Record<string, unknown>;
  sku: string;
  price: number;
  available: boolean;
  imageUrl: string;
};

export type StorefrontProductDetail = {
  id: string;
  brandId: string;
  brandName: string;
  vendorId: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrls: string[];
  optionGroups: unknown[];
  variants: StorefrontProductVariant[];
};

export function publicProductToCard(product: Record<string, unknown>): StorefrontProductCard;
export function firstAvailableVariant(product: Record<string, unknown>): Record<string, unknown> | undefined;
export function lowestPricedAvailableVariant(
  product: { variants?: StorefrontProductVariant[] },
): StorefrontProductVariant | undefined;
export function variantLabel(attributes: Record<string, unknown> | null | undefined): string;
export function variantOptionGroups(
  variants: StorefrontProductVariant[],
): Array<{
  name: string;
  values: Array<{ available: boolean; value: string }>;
}>;
export function resolveVariantFromOptions(
  variants: StorefrontProductVariant[],
  selectedOptions: Record<string, string>,
): StorefrontProductVariant | undefined;
export function isOptionValueAvailable(
  variants: StorefrontProductVariant[],
  selectedOptions: Record<string, string>,
  optionName: string,
  optionValue: string,
): boolean;
export function productDetailToCartItem(product: Record<string, unknown>): StorefrontCartItem | null;
export function publicProductToDetail(product: Record<string, unknown>): StorefrontProductDetail;
export function cartItemFromVariant(
  product: StorefrontProductDetail,
  variant: StorefrontProductVariant,
): StorefrontCartItem | null;
export function buildCheckoutPayload(input: {
  items: Array<{ variantId: string; quantity: number }>;
  customer: { fullName?: string; phone?: string };
  shippingAddress: {
    recipient?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
}): {
  items: Array<{ variantId: string; quantity: number }>;
  customer: { fullName: string; phone: string };
  shippingAddress: {
    recipient: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
};
