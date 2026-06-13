"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/actions/_shared/auth";
import { callRpc } from "@/lib/actions/_shared/rpc";
import { unwrapPayload } from "@/lib/actions/_shared/validation";

export async function getBrands(input: unknown = {}) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  return callRpc("get_brands", payload.data);
}

export async function getBrand(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  return callRpc("get_brand", payload.data);
}

export async function saveBrand(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("save_brand", payload.data);
  if (result.ok) {
    revalidatePath("/vendor/brands");
  }

  return result;
}

export async function deleteBrand(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("save_brand", {
    ...payload.data,
    isActive: false,
  });
  if (result.ok) {
    revalidatePath("/vendor/brands");
  }

  return result;
}

export async function updateBrandActive(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("save_brand", {
    ...payload.data,
    isActive: payload.data.isActive === true,
  });
  if (result.ok) {
    revalidatePath("/vendor/brands");
    revalidatePath("/vendor/dashboard");
  }

  return result;
}
