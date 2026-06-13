"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/actions/_shared/auth";
import { callRpc } from "@/lib/actions/_shared/rpc";
import { unwrapPayload } from "@/lib/actions/_shared/validation";

export async function adminUpdateBrandStatus(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("admin_update_brand_status", payload.data);
  if (result.ok) {
    revalidatePath("/admin/vendors");
  }

  return result;
}

export async function adminUpdateProductStatus(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("admin_update_product_status", payload.data);
  if (result.ok) {
    revalidatePath("/admin/vendors");
    revalidatePath("/admin/products");
  }

  return result;
}
