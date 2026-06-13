"use server";

import { callRpc } from "@/lib/actions/_shared/rpc";
import { requireAuthenticatedUser } from "@/lib/actions/_shared/auth";
import { unwrapPayload } from "@/lib/actions/_shared/validation";

export async function getOrCreateCustomerProfile(input: unknown = {}) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  return callRpc("get_or_create_customer_profile", payload.data);
}
