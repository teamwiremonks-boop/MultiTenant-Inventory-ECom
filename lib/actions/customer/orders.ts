"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/actions/_shared/auth";
import { getServerSupabaseClient } from "@/lib/actions/_shared/auth";
import { callRpc } from "@/lib/actions/_shared/rpc";
import { fail, ok } from "@/lib/actions/_shared/results";
import { unwrapPayload } from "@/lib/actions/_shared/validation";

export async function placeOrder(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("place_order", payload.data);
  if (result.ok) {
    revalidatePath("/orders");
  }

  return result;
}

export async function cancelOrderBranch(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  const result = await callRpc("cancel_order_branch", payload.data);
  if (result.ok) {
    revalidatePath("/orders");
  }

  return result;
}

export async function trackOrder(input: unknown) {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const payload = unwrapPayload(input);
  if (!payload.ok) return payload;

  return callRpc("track_order", payload.data);
}

export async function listCustomerOrders() {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, status, customer_email, customer_phone, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return fail(error.code ?? "CUSTOMER_ORDERS_ERROR", error.message, error.details);
  }

  return ok(data ?? []);
}
