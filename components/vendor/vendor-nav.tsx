"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCcw,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VendorIdentity } from "@/components/vendor/vendor-identity";
import {
  isVendorNavItemActive,
  visibleVendorNavItems,
} from "@/lib/vendor-navigation.mjs";
import { cn } from "@/lib/utils";
import {
  useVendorCatalog,
  vendorCatalogActions,
} from "@/lib/stores/vendor-catalog";

export type VendorNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  requiresSuspension?: boolean;
};

const vendorNav: VendorNavItem[] = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/orders", label: "Orders", icon: ClipboardList },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/stores", label: "Stores", icon: Store },
  { href: "/vendor/brands", label: "Brands", icon: Boxes },
  {
    href: "/vendor/reactivation",
    label: "Reactivation",
    icon: RefreshCcw,
    requiresSuspension: true,
  },
];

const getVisibleVendorNavItems = visibleVendorNavItems as (
  items: VendorNavItem[],
  workspace?: { isSuspended?: boolean },
) => VendorNavItem[];

const isActiveVendorNavItem = isVendorNavItemActive as (
  href: string,
  pathname: string,
) => boolean;

type VendorSidebarNavProps = {
  items?: VendorNavItem[];
};

type VendorMobileNavProps = {
  items?: VendorNavItem[];
};

export function VendorSidebarNav({ items = vendorNav }: VendorSidebarNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const workspace = useVendorCatalog((state) => state.workspace);

  useEffect(() => {
    void vendorCatalogActions.loadCatalog();
  }, []);

  const visibleItems = getVisibleVendorNavItems(items, {
    isSuspended: workspace?.isSuspended,
  });

  return (
    <div
      className={cn(
        "hidden border-r bg-background transition-[width] duration-200 md:block",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 px-4">
        <div
          className={cn(
            "flex min-w-0 items-center gap-2",
            collapsed && "sr-only",
          )}
        >
          <Building2 className="size-5 shrink-0" />
          <VendorIdentity />
        </div>
        <Button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((value) => !value)}
          size="icon"
          type="button"
          variant="ghost"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>
      <Separator />
      <nav className="space-y-1 p-3">
        {visibleItems.map((item) => {
          const active = isActiveVendorNavItem(item.href, pathname);

          return (
            <Button
              asChild
              className={cn(
                "w-full justify-start gap-3",
                collapsed && "justify-center px-0",
                active &&
                  "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground",
              )}
              key={item.href}
              title={collapsed ? item.label : undefined}
              variant={active ? "default" : "ghost"}
            >
              <Link href={item.href}>
                <item.icon className="size-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}

export function VendorMobileNav({ items = vendorNav }: VendorMobileNavProps) {
  const pathname = usePathname();
  const workspace = useVendorCatalog((state) => state.workspace);

  useEffect(() => {
    void vendorCatalogActions.loadCatalog();
  }, []);

  const visibleItems = getVisibleVendorNavItems(items, {
    isSuspended: workspace?.isSuspended,
  });

  return (
    <nav className="mt-3 flex gap-2 overflow-x-auto md:hidden">
      {visibleItems.map((item) => {
        const active = isActiveVendorNavItem(item.href, pathname);

        return (
          <Link
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground",
              "hover:bg-muted hover:text-foreground",
              active &&
                "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
            )}
            href={item.href}
            key={item.href}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
