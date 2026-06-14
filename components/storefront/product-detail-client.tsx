"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductOptionSelector } from "@/components/storefront/product-option-selector";
import { ProductImageBento } from "@/components/storefront/product-image-bento";
import { RichProductDescription } from "@/components/storefront/rich-product-description";
import { useCartStore } from "@/lib/stores/cart-store";
import {
  cartItemFromVariant,
  effectiveProductImages,
  lowestPricedAvailableVariant,
  resolveVariantFromOptions,
  type StorefrontProductDetail,
} from "@/lib/storefront-products";

type ProductDetailClientProps = {
  product: StorefrontProductDetail;
};

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const addItem = useCartStore((state) => state.addItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const cartItems = useCartStore((state) => state.items);
  const defaultVariant = useMemo(
    () => lowestPricedAvailableVariant(product) ?? product.variants[0],
    [product],
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        Object.entries(defaultVariant?.attributes ?? {}).map(([name, value]) => [
          name,
          String(value),
        ]),
      ),
  );
  const selectedVariant = useMemo(
    () => resolveVariantFromOptions(product.variants, selectedOptions),
    [product.variants, selectedOptions],
  );
  const cartItem = selectedVariant
    ? cartItems.find((item) => item.variantId === selectedVariant.id)
    : undefined;
  const imageUrls = effectiveProductImages(product.imageUrls, selectedVariant);

  const addSelectedVariant = () => {
    if (!selectedVariant) return;
    const item = cartItemFromVariant(product, selectedVariant);
    if (item) addItem(item);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 md:grid-cols-[1fr_0.9fr] md:px-6">
        <section className="flex flex-col gap-4">
          <Button asChild className="w-fit" variant="ghost">
            <Link href="/">Back to products</Link>
          </Button>
          <ProductImageBento imageUrls={imageUrls} productName={product.name} />
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              {product.brandName || "Marketplace"}
            </p>
            <h1 className="text-3xl font-semibold tracking-normal md:text-5xl">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold">
              ₹{(selectedVariant?.price ?? product.basePrice).toLocaleString("en-IN")}
            </p>
            <Badge className="w-fit" variant={selectedVariant?.available ? "secondary" : "outline"}>
              {selectedVariant?.available ? "In stock" : "Unavailable"}
            </Badge>
          </div>

          {product.description && (
            <RichProductDescription
              className="text-base leading-7"
              html={product.description}
            />
          )}

          <Separator />

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium">Choose options</h2>
            <ProductOptionSelector
              onChange={(name, value) =>
                setSelectedOptions((current) => ({ ...current, [name]: value }))
              }
              selectedOptions={selectedOptions}
              variants={product.variants}
            />
          </div>

          {cartItem ? (
            <div className="flex w-full max-w-xs items-center justify-between rounded-md border">
              <Button
                aria-label="Decrease quantity"
                onClick={() => decrementItem(cartItem.variantId)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Minus />
              </Button>
              <span className="font-medium">{cartItem.quantity}</span>
              <Button
                aria-label="Increase quantity"
                onClick={() => incrementItem(cartItem.variantId)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Plus />
              </Button>
            </div>
          ) : (
            <Button
              className="w-full max-w-xs"
              disabled={!selectedVariant?.available}
              onClick={addSelectedVariant}
              type="button"
            >
              <ShoppingCart data-icon="inline-start" />
              Add to cart
            </Button>
          )}
        </section>
      </div>
    </main>
  );
}
