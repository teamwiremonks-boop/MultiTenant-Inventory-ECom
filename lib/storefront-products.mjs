import sanitizeHtml from "sanitize-html";

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function firstString(values) {
  return asArray(values).find((value) => typeof value === "string") ?? "";
}

function normalizedImages(values) {
  return [...new Set(
    asArray(values)
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean),
  )].slice(0, 5);
}

export function effectiveProductImages(productImages, variant) {
  const variantImages = normalizedImages(
    variant?.imageUrls ?? variant?.image_urls ?? variant?.images,
  );
  return variantImages.length > 0 ? variantImages : normalizedImages(productImages);
}

export function sanitizeProductDescription(html, { links = true } = {}) {
  return sanitizeHtml(typeof html === "string" ? html : "", {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h2",
      "h3",
      "h4",
      ...(links ? ["a"] : ["span"]),
    ],
    allowedAttributes: links ? { a: ["href", "target", "rel"] } : {},
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: links
      ? {
          a: (_tagName, attributes) => ({
            tagName: "a",
            attribs: {
              ...attributes,
              rel: "noopener noreferrer",
            },
          }),
        }
      : { a: "span" },
  });
}

export function productBentoLayout(imageCount) {
  const count = Math.max(0, Math.min(5, Math.floor(asNumber(imageCount))));
  if (count === 0) return [];
  if (count === 1) return [[1]];
  if (count === 2) return [[1, 1]];
  if (count === 3) return [[1], [1, 1]];
  if (count === 4) return [[1, 1], [1, 1]];
  return [[3, 2], [1, 1, 1]];
}

export function publicProductToCard(product) {
  const productImages = product?.productImages ?? product?.product_images;
  const imageUrls = normalizedImages(productImages);

  return {
    id: product?.id ?? "",
    brandName: product?.brandName ?? product?.brand_name ?? "",
    name: product?.name ?? "Untitled product",
    description: product?.description ?? "",
    basePrice: asNumber(product?.basePrice ?? product?.base_price, 0),
    imageUrl: firstString(imageUrls),
    imageUrls,
    available: product?.available === true,
    variantCount: asNumber(product?.variantCount ?? product?.variant_count, 0),
    variants: asArray(product?.variants).map((variant) =>
      publicVariantToDetail(variant, { ...product, productImages }),
    ),
  };
}

export function firstAvailableVariant(product) {
  return asArray(product?.variants).find(
    (variant) =>
      variant?.id &&
      variant?.available === true &&
      variant?.isActive !== false &&
      variant?.is_active !== false,
  );
}

export function lowestPricedAvailableVariant(product) {
  return asArray(product?.variants)
    .filter(
      (variant) =>
        variant?.id &&
        variant?.available === true &&
        variant?.isActive !== false &&
        variant?.is_active !== false,
    )
    .sort((left, right) => asNumber(left?.price) - asNumber(right?.price))[0];
}

export function variantLabel(attributes) {
  const entries = Object.entries(attributes ?? {});
  if (entries.length === 0) return "Default";

  return entries.map(([name, value]) => `${name}: ${value}`).join(" / ");
}

export function variantOptionGroups(variants) {
  const groups = [];
  for (const variant of asArray(variants)) {
    for (const [name, value] of Object.entries(variant?.attributes ?? {})) {
      let group = groups.find((item) => item.name === name);
      if (!group) {
        group = { name, values: [] };
        groups.push(group);
      }

      const textValue = String(value);
      const existing = group.values.find((item) => item.value === textValue);
      if (existing) {
        existing.available = existing.available || variant?.available === true;
      } else {
        group.values.push({
          available: variant?.available === true,
          value: textValue,
        });
      }
    }
  }

  return groups;
}

export function resolveVariantFromOptions(variants, selectedOptions) {
  return asArray(variants).find((variant) =>
    Object.entries(selectedOptions ?? {}).every(
      ([name, value]) =>
        String(variant?.attributes?.[name] ?? "") === String(value),
    ),
  );
}

export function isOptionValueAvailable(
  variants,
  selectedOptions,
  optionName,
  optionValue,
) {
  return asArray(variants).some((variant) => {
    if (variant?.available !== true) return false;

    return Object.entries({
      ...(selectedOptions ?? {}),
      [optionName]: optionValue,
    }).every(
      ([name, value]) =>
        String(variant?.attributes?.[name] ?? "") === String(value),
    );
  });
}

export function productDetailToCartItem(product) {
  const variant = firstAvailableVariant(product);
  if (!variant) return null;

  return cartItemFromVariant(publicProductToDetail(product), publicVariantToDetail(variant, product));
}

function publicVariantToDetail(variant, product) {
  const productImages = product?.productImages ?? product?.product_images;
  const variantImages = variant?.images ?? variant?.imageUrls ?? variant?.image_urls;
  const imageUrls = normalizedImages(variantImages);

  return {
    id: variant?.id ?? "",
    attributes: variant?.attributes ?? {},
    sku: variant?.sku ?? "",
    price: asNumber(variant?.price, asNumber(product?.basePrice ?? product?.base_price, 0)),
    available: variant?.available === true,
    imageUrl: firstString(imageUrls) || firstString(productImages),
    imageUrls,
  };
}

export function publicProductToDetail(product) {
  return {
    id: product?.id ?? "",
    brandId: product?.brandId ?? product?.brand_id ?? "",
    brandName: product?.brandName ?? product?.brand_name ?? "",
    vendorId: product?.vendorId ?? product?.vendor_id ?? "",
    name: product?.name ?? "Untitled product",
    description: product?.description ?? "",
    basePrice: asNumber(product?.basePrice ?? product?.base_price, 0),
    imageUrls: normalizedImages(product?.productImages ?? product?.product_images),
    optionGroups: asArray(product?.optionGroups ?? product?.option_groups),
    variants: asArray(product?.variants).map((variant) =>
      publicVariantToDetail(variant, product),
    ),
  };
}

export function cartItemFromVariant(product, variant) {
  if (!product?.id || !variant?.id || !variant.available) return null;
  return {
    productId: product.id,
    variantId: variant.id,
    name: product.name,
    brandName: product.brandName,
    variantLabel: variantLabel(variant.attributes),
    sku: variant.sku,
    price: variant.price,
    imageUrl: variant.imageUrl || firstString(product.imageUrls),
    quantity: 1,
  };
}

export function buildCheckoutPayload({ items, customer, shippingAddress }) {
  const address = {
    recipient: shippingAddress?.recipient ?? "",
    phone: shippingAddress?.phone ?? "",
    line1: shippingAddress?.line1 ?? "",
    city: shippingAddress?.city ?? "",
    state: shippingAddress?.state ?? "",
    postalCode: shippingAddress?.postalCode ?? "",
  };
  if (shippingAddress?.line2) {
    address.line2 = shippingAddress.line2;
  }

  return {
    items: asArray(items).map((item) => ({
      variantId: item.variantId,
      quantity: asNumber(item.quantity, 1),
    })),
    customer: {
      fullName: customer?.fullName ?? "",
      phone: customer?.phone ?? "",
    },
    shippingAddress: address,
  };
}
