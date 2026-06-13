"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/actions/_shared/auth";
import { callRpc } from "@/lib/actions/_shared/rpc";
import { unwrapPayload } from "@/lib/actions/_shared/validation";
import { getVendorStores as loadVendorStores } from "./workspace";

export async function getVendorStores() {
  return loadVendorStores();
}

export async function createStore(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("create_store", payload.data);
  if (result.ok) {
    revalidatePath("/vendor/stores");
  }

  return result;
}

export async function updateStore(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("update_store", payload.data);
  if (result.ok) {
    revalidatePath("/vendor/stores");
  }

  return result;
}

export async function getStore(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  return callRpc("get_store", payload.data);
}

export async function deleteStore(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("update_store", {
    ...payload.data,
    isActive: false,
  });
  if (result.ok) {
    revalidatePath("/vendor/stores");
  }

  return result;
}

export async function updateStoreActive(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("update_store", {
    ...payload.data,
    isActive: payload.data.isActive === true,
  });
  if (result.ok) {
    revalidatePath("/vendor/stores");
    revalidatePath("/vendor/dashboard");
  }

  return result;
}
