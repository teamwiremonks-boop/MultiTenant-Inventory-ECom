"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { StorefrontCartItem } from "@/lib/storefront-products";

type CartState = {
  items: StorefrontCartItem[];
  addItem: (item: StorefrontCartItem) => void;
  clearCart: () => void;
  decrementItem: (variantId: string) => void;
  incrementItem: (variantId: string) => void;
  removeItem: (variantId: string) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (cartItem) => cartItem.variantId === item.variantId,
          );

          if (!existing) {
            return { items: [...state.items, item] };
          }

          return {
            items: state.items.map((cartItem) =>
              cartItem.variantId === item.variantId
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem,
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
      decrementItem: (variantId) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.variantId === variantId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      incrementItem: (variantId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        })),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
    }),
    {
      name: "ecom-inventory-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function cartItemCount(items: StorefrontCartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal(items: StorefrontCartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
