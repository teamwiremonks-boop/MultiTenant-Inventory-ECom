function asNumber(value, fallback = 0) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function asText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function pick(object, ...keys) {
  for (const key of keys) {
    if (object && object[key] !== undefined && object[key] !== null) {
      return object[key];
    }
  }

  return undefined;
}

function arraysEqualByEntries(left, right) {
  const leftEntries = Object.entries(left ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const rightEntries = Object.entries(right ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return JSON.stringify(leftEntries) === JSON.stringify(rightEntries);
}

function slugSku(parts) {
  return parts
    .map((part) => asText(part).toUpperCase().replace(/[^A-Z0-9]+/g, "-"))
    .filter(Boolean)
    .join("-");
}

function product(values) {
  return values.reduce(
    (rows, group) =>
      rows.flatMap((row) =>
        group.values.map((value) => ({
          labelParts: [...row.labelParts, value],
          attributes: { ...row.attributes, [group.name]: value },
        })),
      ),
    [{ labelParts: [], attributes: {} }],
  );
}

function normalizeOptionGroups(optionGroups = []) {
  return optionGroups
    .map((group, groupIndex) => ({
      ...(group.id ? { id: group.id } : {}),
      name: asText(group.name),
      sortOrder: pick(group, "sortOrder", "sort_order") ?? groupIndex,
      values: (group.values ?? [])
        .map((value, valueIndex) => {
          const normalized =
            typeof value === "string" ? { value } : { ...value };
          return {
            ...(normalized.id ? { id: normalized.id } : {}),
            value: asText(normalized.value),
            sortOrder: pick(normalized, "sortOrder", "sort_order") ?? valueIndex,
          };
        })
        .filter((value) => value.value),
    }))
    .filter((group) => group.name && group.values.length > 0);
}

function normalizeInventory(stores, inventory = []) {
  if (stores.length === 0) {
    return inventory.map((item) => ({
      storeId: pick(item, "storeId", "store_id"),
      quantity: asNumber(item?.quantity, 0),
    }));
  }

  return stores.map((store) => {
    const current = inventory.find(
      (item) => pick(item, "storeId", "store_id") === store.id,
    );
    return {
      storeId: store.id,
      quantity: asNumber(current?.quantity, 0),
    };
  });
}

export function generateVariantMatrix({
  basePrice = 0,
  existingVariants = [],
  optionGroups = [],
  stores = [],
}) {
  const normalizedGroups = normalizeOptionGroups(optionGroups);
  const combinations = normalizedGroups.length
    ? product(
        normalizedGroups.map((group) => ({
          name: group.name,
          values: group.values.map((value) => value.value),
        })),
      )
    : [{ labelParts: ["Default"], attributes: {} }];

  return combinations.map((combination) => {
    const existing = existingVariants.find((variant) =>
      arraysEqualByEntries(variant.attributes, combination.attributes),
    );

    return {
      ...(existing?.id ? { id: existing.id } : {}),
      label: combination.labelParts.join(" / "),
      attributes: combination.attributes,
      sku: existing?.sku ?? slugSku(combination.labelParts),
      price: asNumber(existing?.price, asNumber(basePrice, 0)),
      imageUrls: Array.isArray(existing?.imageUrls) ? existing.imageUrls : [],
      isActive:
        typeof existing?.isActive === "boolean" ? existing.isActive : true,
      inventory: normalizeInventory(stores, existing?.inventory),
    };
  });
}

export function productResponseToFormValues(productResponse) {
  const productIsActive = pick(productResponse, "isActive", "is_active");

  return {
    id: productResponse.id,
    brandId: pick(productResponse, "brandId", "brand_id") ?? "",
    name: productResponse.name ?? "",
    description: productResponse.description ?? "",
    basePrice: asNumber(pick(productResponse, "basePrice", "base_price"), 0),
    productImages: Array.isArray(
      pick(productResponse, "productImages", "product_images"),
    )
      ? pick(productResponse, "productImages", "product_images")
      : [],
    isActive: typeof productIsActive === "boolean" ? productIsActive : true,
    optionGroups: normalizeOptionGroups(
      pick(productResponse, "optionGroups", "option_groups"),
    ),
    variants: (productResponse.variants ?? []).map((variant) => {
      const variantIsActive = pick(variant, "isActive", "is_active");

      return {
        id: variant.id,
        attributes: variant.attributes ?? {},
        sku: variant.sku ?? "",
        price: asNumber(variant.price, 0),
        imageUrls: Array.isArray(pick(variant, "imageUrls", "image_urls"))
          ? pick(variant, "imageUrls", "image_urls")
          : Array.isArray(variant.images)
            ? variant.images
            : [],
        isActive:
          typeof variantIsActive === "boolean" ? variantIsActive : true,
        inventory: normalizeInventory(
          [],
          Array.isArray(pick(variant, "inventory", "variant_inventory"))
            ? pick(variant, "inventory", "variant_inventory")
            : [],
        ),
      };
    }),
  };
}

export function buildProductMutationPayload(values) {
  return {
    product: {
      ...(values.id ? { id: values.id } : {}),
      brandId: values.brandId,
      name: values.name,
      description: values.description ?? "",
      basePrice: asNumber(values.basePrice, 0),
      isActive: values.isActive !== false,
      productImages: values.productImages ?? [],
      optionGroups: normalizeOptionGroups(values.optionGroups),
      variants: (values.variants ?? []).map((variant) => ({
        ...(variant.id ? { id: variant.id } : {}),
        attributes: variant.attributes ?? {},
        sku: variant.sku,
        price: asNumber(variant.price, 0),
        isActive: variant.isActive !== false,
        imageUrls: variant.imageUrls ?? [],
        inventory: (variant.inventory ?? []).map((inventory) => ({
          storeId: inventory.storeId,
          quantity: asNumber(inventory.quantity, 0),
        })),
      })),
    },
  };
}
