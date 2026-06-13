function readBoolean(...values) {
  for (const value of values) {
    if (typeof value === "boolean") return value;
  }

  return undefined;
}

export function isVendorBrandActive(brand) {
  return readBoolean(brand?.isActive, brand?.is_active) !== false;
}

export function vendorBrandOptionLabel(brand) {
  return isVendorBrandActive(brand) ? brand.name : `${brand.name} (inactive)`;
}

export function statusLabel(row) {
  if (row?.platform_status && row.platform_status !== "active") {
    return row.platform_status;
  }

  const isActive = readBoolean(row?.isActive, row?.is_active);
  return isActive === false ? "inactive" : "active";
}
