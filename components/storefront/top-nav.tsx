"use client";

import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Store, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cartItemCount, useCartStore } from "@/lib/stores/cart-store";

type StorefrontTopNavProps = {
  isAuthenticated?: boolean;
  isVendor?: boolean;
  onCartOpen: () => void;
};

export function StorefrontTopNav({
  isAuthenticated = false,
  isVendor = false,
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

        <div className="min-w-0 flex-1" />

        <nav className="flex w-full flex-wrap items-center gap-2 md:w-auto">
          <ThemeToggle />
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
