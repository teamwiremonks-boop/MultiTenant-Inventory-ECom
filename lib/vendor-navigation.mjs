export function visibleVendorNavItems(items, workspace = {}) {
  return items.filter((item) => !item.requiresSuspension || workspace.isSuspended);
}

export function isVendorNavItemActive(href, pathname) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
