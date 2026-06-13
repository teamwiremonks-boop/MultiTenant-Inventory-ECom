"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  cartItemCount,
  cartSubtotal,
  useCartStore,
} from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";

type CartPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CartPanel({ open, onOpenChange }: CartPanelProps) {
  const items = useCartStore((state) => state.items);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = cartSubtotal(items);
  const count = cartItemCount(items);

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 transition",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        aria-label="Close cart"
        className={cn(
          "absolute inset-0 bg-foreground/20 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={() => onOpenChange(false)}
        type="button"
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l bg-background shadow-xl transition-transform",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-lg font-semibold">Cart</h2>
            <p className="text-sm text-muted-foreground">
              {count} {count === 1 ? "item" : "items"}
            </p>
          </div>
          <Button
            aria-label="Close cart"
            onClick={() => onOpenChange(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {items.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
              <ShoppingBagIcon />
              <div>
                <p className="font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">
                  Add products from the catalog to begin checkout.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div className="flex gap-3" key={item.variantId}>
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {item.imageUrl ? (
                      <Image
                        alt={item.name}
                        className="object-cover"
                        fill
                        sizes="80px"
                        src={item.imageUrl}
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.variantLabel}
                        </p>
                      </div>
                      <Button
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.variantId)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-md border">
                        <Button
                          aria-label={`Decrease ${item.name}`}
                          onClick={() => decrementItem(item.variantId)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Minus />
                        </Button>
                        <span className="w-9 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          aria-label={`Increase ${item.name}`}
                          onClick={() => incrementItem(item.variantId)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Plus />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>
          <Separator className="my-4" />
          {items.length === 0 ? (
            <Button className="w-full" disabled type="button">
              Checkout
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/checkout" onClick={() => onOpenChange(false)}>
                Checkout
              </Link>
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}

function ShoppingBagIcon() {
  return (
    <div className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
      <ShoppingBag />
    </div>
  );
}
