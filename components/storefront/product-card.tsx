"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProductOptionSelector } from "@/components/storefront/product-option-selector";
import { useCartStore } from "@/lib/stores/cart-store";
import {
  cartItemFromVariant,
  lowestPricedAvailableVariant,
  resolveVariantFromOptions,
  type StorefrontProductCard,
} from "@/lib/storefront-products";

type ProductCardProps = {
  product: StorefrontProductCard;
};

export function ProductCard({ product }: ProductCardProps) {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const [error, setError] = useState<string | null>(null);
  const defaultVariant = useMemo(
    () => lowestPricedAvailableVariant(product),
    [product],
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        Object.entries(
          (defaultVariant ?? product.variants[0])?.attributes ?? {},
        ).map(([name, value]) => [name, String(value)]),
      ),
  );
  const selectedVariant = useMemo(
    () => resolveVariantFromOptions(product.variants, selectedOptions),
    [product.variants, selectedOptions],
  );
  const cartItem = selectedVariant
    ? items.find((item) => item.variantId === selectedVariant.id)
    : undefined;

  function addToCart() {
    setError(null);

    const item = selectedVariant
      ? cartItemFromVariant(
          { ...product, imageUrls: product.imageUrl ? [product.imageUrl] : [] },
          selectedVariant,
        )
      : null;

    if (!item) {
      setError("Select an available combination.");
      return;
    }

    addItem(item);
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-muted">
        {selectedVariant?.imageUrl || product.imageUrl ? (
          <Image
            alt={product.name}
            className="object-cover transition duration-300 hover:scale-105"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            src={selectedVariant?.imageUrl || product.imageUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <CardContent className="flex min-h-40 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">
              {product.brandName || "Marketplace"}
            </p>
            <Link
              className="mt-1 line-clamp-2 font-semibold hover:underline"
              href={`/products/${product.id}`}
            >
              {product.name}
            </Link>
          </div>
          <Badge variant={product.available ? "secondary" : "outline"}>
            {product.available ? "In stock" : "Sold out"}
          </Badge>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.description || "Ready for checkout from verified vendors."}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <p className="text-lg font-semibold">
            Rs. {(selectedVariant?.price ?? product.basePrice).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-muted-foreground">
            {product.variantCount} {product.variantCount === 1 ? "choice" : "choices"}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-4 pt-0">
        <ProductOptionSelector
          onChange={(name, value) => {
            setSelectedOptions((current) => ({ ...current, [name]: value }));
            setError(null);
          }}
          selectedOptions={selectedOptions}
          variants={product.variants}
        />
        {cartItem ? (
          <div className="flex items-center justify-between rounded-md border">
            <Button
              aria-label={`Decrease ${product.name}`}
              onClick={() => decrementItem(cartItem.variantId)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Minus />
            </Button>
            <span className="text-sm font-medium">{cartItem.quantity}</span>
            <Button
              aria-label={`Increase ${product.name}`}
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
            className="w-full"
            disabled={!product.available || selectedVariant?.available !== true}
            onClick={addToCart}
            type="button"
          >
            {product.available ? (
              <ShoppingCart data-icon="inline-start" />
            ) : (
              <Plus data-icon="inline-start" />
            )}
            {product.available ? "Add to cart" : "Unavailable"}
          </Button>
        )}
        <Button asChild className="w-full" variant="outline">
          <Link href={`/products/${product.id}`}>View details</Link>
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardFooter>
    </Card>
  );
}
