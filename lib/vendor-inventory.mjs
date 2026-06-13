function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function variantOptionText(attributes) {
  const entries = Object.entries(attributes ?? {}).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  if (entries.length === 0) return "Default";

  return entries.map(([name, value]) => `${name}: ${value}`).join(" / ");
}

export function setVariantInventoryQuantity(product, update) {
  return {
    ...product,
    variants: (product?.variants ?? []).map((variant) => {
      if (variant.id !== update.variantId) return variant;

      const inventory = variant.inventory ?? [];
      const found = inventory.some((row) => row.storeId === update.storeId);
      const nextInventory = found
        ? inventory.map((row) =>
            row.storeId === update.storeId
              ? { ...row, quantity: asNumber(update.quantity) }
              : row,
          )
        : [
            ...inventory,
            { storeId: update.storeId, quantity: asNumber(update.quantity) },
          ];

      return {
        ...variant,
        inventory: nextInventory,
      };
    }),
  };
}

export function inventoryTotalForStore(product, storeId) {
  return (product?.variants ?? []).reduce(
    (total, variant) =>
      total +
      (variant.inventory ?? [])
        .filter((row) => row.storeId === storeId)
        .reduce((sum, row) => sum + asNumber(row.quantity), 0),
    0,
  );
}
