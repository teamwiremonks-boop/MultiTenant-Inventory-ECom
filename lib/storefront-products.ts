export {
  buildCheckoutPayload,
  cartItemFromVariant,
  firstAvailableVariant,
  isOptionValueAvailable,
  lowestPricedAvailableVariant,
  productDetailToCartItem,
  publicProductToDetail,
  publicProductToCard,
  resolveVariantFromOptions,
  variantLabel,
  variantOptionGroups,
} from "./storefront-products.mjs";

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
