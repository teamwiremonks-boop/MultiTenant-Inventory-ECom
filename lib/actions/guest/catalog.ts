"use server";

import { callRpc } from "@/lib/actions/_shared/rpc";
import { unwrapPayload } from "@/lib/actions/_shared/validation";

export async function getPublicProducts(input: unknown = {}) {
  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  return callRpc("get_public_products", payload.data);
}

export async function getPublicProduct(input: unknown) {
  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  return callRpc("get_public_product", payload.data);
}
