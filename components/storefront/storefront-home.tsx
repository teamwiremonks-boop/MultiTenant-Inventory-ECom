"use client";

import { useMemo, useState } from "react";

import { CartPanel } from "@/components/storefront/cart-panel";
import { ProductCard } from "@/components/storefront/product-card";
import { StorefrontTopNav } from "@/components/storefront/top-nav";
import { Button } from "@/components/ui/button";
import type { StorefrontProductCard } from "@/lib/storefront-products";

type StorefrontHomeProps = {
  isAuthenticated?: boolean;
  isVendor?: boolean;
  products: StorefrontProductCard[];
};

export function StorefrontHome({
  isAuthenticated = false,
  isVendor = false,
  products,
}: StorefrontHomeProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      [product.name, product.brandName, product.description]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [products, search]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StorefrontTopNav
        isAuthenticated={isAuthenticated}
        isVendor={isVendor}
        onCartOpen={() => setCartOpen(true)}
        onSearchChange={setSearch}
        search={search}
      />
      <main>
        <section className="border-b">
          <div className="mx-auto grid min-h-[420px] w-full max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-6 lg:py-16">
            <div className="flex flex-col gap-6">
              <div className="flex max-w-2xl flex-col gap-4">
                <h1 className="text-4xl font-semibold tracking-normal md:text-6xl">
                  Everyday products from local vendors
                </h1>
                <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                  Browse live catalog items, add products to cart, and checkout
                  when you are ready. Vendors manage stock, variants, and order
                  status behind the scenes.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => setCartOpen(true)} type="button">
                  View cart
                </Button>
                <Button asChild variant="outline">
                  <a href="#products">Shop products</a>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border bg-card p-3 shadow-xs">
              <div className="aspect-5/3 rounded-md bg-muted p-4">
                <div className="flex h-full flex-col justify-between rounded-md border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fresh picks</span>
                    <span className="text-xs text-muted-foreground">
                      Updated catalog
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {products.slice(0, 3).map((product) => (
                      <div
                        className="rounded-md border bg-card p-2"
                        key={product.id}
                      >
                        <div className="aspect-square rounded-sm bg-muted" />
                        <p className="mt-2 truncate text-xs font-medium">
                          {product.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {products.length} products visible
                    </span>
                    <span className="font-semibold">Cart ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 md:px-6" id="products">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">
                Products
              </h2>
              <p className="text-sm text-muted-foreground">
                Public catalog items are visible to everyone.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-lg border bg-card p-10 text-center">
              <p className="font-medium">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try another search term.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <CartPanel onOpenChange={setCartOpen} open={cartOpen} />
    </div>
  );
}
