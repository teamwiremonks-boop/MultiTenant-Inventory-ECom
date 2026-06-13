export type VendorNavItem = {
  href: string;
  label: string;
  requiresSuspension?: boolean;
};

export function visibleVendorNavItems<TItem extends VendorNavItem>(
  items: TItem[],
  workspace?: { isSuspended?: boolean },
): TItem[];

export function isVendorNavItemActive(href: string, pathname: string): boolean;
