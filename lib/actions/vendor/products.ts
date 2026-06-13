"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/actions/_shared/auth";
import { callRpc } from "@/lib/actions/_shared/rpc";
import { unwrapPayload } from "@/lib/actions/_shared/validation";
import {
  buildProductMutationPayload,
  productResponseToFormValues,
} from "@/lib/product-builder.mjs";

export async function getProducts(input: unknown = {}) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  return callRpc("get_products", payload.data);
}

export async function getProduct(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  return callRpc("get_product", payload.data);
}

export async function saveProduct(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("save_product", payload.data);
  if (result.ok) {
    revalidatePath("/vendor/products");
  }

  return result;
}

export async function deleteProduct(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("delete_product", payload.data);
  if (result.ok) {
    revalidatePath("/vendor/products");
  }

  return result;
}

export async function updateProductActive(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const productId =
    typeof payload.data.productId === "string"
      ? payload.data.productId
      : typeof payload.data.id === "string"
        ? payload.data.id
        : "";

  if (!productId) {
    return {
      ok: false,
      error: {
        code: "INVALID_PRODUCT",
        message: "productId is required.",
      },
    } as const;
  }

  const current = await callRpc("get_product", { productId });
  if (!current.ok) return current;

  const values = productResponseToFormValues(current.data);
  const result = await callRpc(
    "save_product",
    buildProductMutationPayload({
      ...values,
      id: productId,
      isActive: payload.data.isActive === true,
    }),
  );

  if (result.ok) {
    revalidatePath("/vendor/products");
    revalidatePath("/vendor/dashboard");
  }

  return result;
}
