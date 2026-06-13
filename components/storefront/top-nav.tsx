"use client";

import Link from "next/link";
import { LayoutDashboard, Search, ShoppingCart, Store, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { cartItemCount, useCartStore } from "@/lib/stores/cart-store";

type StorefrontTopNavProps = {
  isAuthenticated?: boolean;
  isVendor?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onCartOpen: () => void;
};

export function StorefrontTopNav({
  isAuthenticated = false,
  isVendor = false,
  search,
  onSearchChange,
  onCartOpen,
}: StorefrontTopNavProps) {
  const count = useCartStore((state) => cartItemCount(state.items));

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Store data-icon="inline-start" />
          </span>
          Market Place
        </Link>

        <div className="relative min-w-0 flex-1 md:max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search products"
            className="pl-10"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search products"
            value={search}
          />
        </div>

        <nav className="flex items-center gap-2">
          <Button
            aria-label={`Open cart with ${count} items`}
            className="relative"
            onClick={onCartOpen}
            type="button"
            variant="outline"
          >
            <ShoppingCart data-icon="inline-start" />
            Cart
            {count > 0 && (
              <Badge className="ml-1 min-w-6 justify-center px-1.5" variant="secondary">
                {count}
              </Badge>
            )}
          </Button>
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/orders">Orders</Link>
              </Button>
              <Button asChild aria-label="Profile" size="icon" variant="ghost">
                <Link href="/profile">
                  <User />
                </Link>
              </Button>
              {isVendor && (
                <Button asChild variant="outline">
                  <Link href="/vendor/dashboard">
                    <LayoutDashboard data-icon="inline-start" />
                    Dashboard
                  </Link>
                </Button>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Button asChild aria-label="Login" variant="outline">
                <Link href="/auth/login">
                  Sign In
                </Link>
              </Button>
              <Button asChild>
                <Link href="/business/sign-up">Sign up for business</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
