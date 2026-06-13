"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/actions/_shared/auth";
import { callRpc } from "@/lib/actions/_shared/rpc";
import { unwrapPayload } from "@/lib/actions/_shared/validation";

export async function requestVendorReactivation(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("request_vendor_reactivation", payload.data);
  if (result.ok) {
    revalidatePath("/vendor");
  }

  return result;
}
