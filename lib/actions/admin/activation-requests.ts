"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/actions/_shared/auth";
import { callRpc } from "@/lib/actions/_shared/rpc";
import { unwrapPayload } from "@/lib/actions/_shared/validation";

export async function adminGetActivationRequests(input: unknown = {}) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  return callRpc("admin_get_activation_requests", payload.data);
}

export async function adminResolveActivationRequest(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("admin_resolve_activation_request", payload.data);
  if (result.ok) {
    revalidatePath("/admin/activation-requests");
    revalidatePath("/admin/vendors");
  }

  return result;
}
