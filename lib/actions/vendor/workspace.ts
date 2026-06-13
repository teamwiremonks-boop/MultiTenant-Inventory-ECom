"use server";

"use server";

import { requireAuthenticatedUser } from "@/lib/actions/_shared/auth";
import { fail, ok } from "@/lib/actions/_shared/results";
import { getServerSupabaseClient } from "@/lib/actions/_shared/auth";
import type { VendorStore, VendorWorkspace } from "@/lib/vendor-data";

export async function getVendorWorkspace() {
  const user = await requireAuthenticatedUser();
  if (!user.ok) return user;

  const supabase = await getServerSupabaseClient();
  const { data: membership, error: membershipError } = await supabase
    .from("vendor_members")
    .select("vendor_id")
    .eq("user_id", user.data.id)
    .maybeSingle();

  if (membershipError) {
    return fail(
      membershipError.code ?? "VENDOR_WORKSPACE_ERROR",
      membershipError.message,
      membershipError.details,
    );
  }

  const { data: vendor, error: vendorError } = membership?.vendor_id
    ? await supabase
        .from("vendors")
        .select("*")
        .eq("id", membership.vendor_id)
        .maybeSingle()
    : { data: null, error: null };

  if (vendorError) {
    return fail(
      vendorError.code ?? "VENDOR_ERROR",
      vendorError.message,
      vendorError.details,
    );
  }

  const vendorRecord = (vendor ?? {}) as Record<string, unknown>;
  const vendorName =
    readText(vendorRecord.name) ??
    readText(vendorRecord.vendor_name) ??
    readText(vendorRecord.business_name) ??
    user.data.email ??
    "Vendor";
  const platformStatus = readText(vendorRecord.platform_status);

  return ok<VendorWorkspace>({
    vendorId: membership?.vendor_id,
    vendorName,
    platformStatus,
    isSuspended: platformStatus === "suspended",
  });
}

export async function getVendorStores() {
  const workspace = await getVendorWorkspace();
  if (!workspace.ok) return workspace;

  if (!workspace.data.vendorId) {
    return ok<VendorStore[]>([]);
  }

  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("vendor_id", workspace.data.vendorId)
    .order("created_at", { ascending: false });

  if (error) {
    return fail(error.code ?? "VENDOR_STORES_ERROR", error.message, error.details);
  }

  return ok((data ?? []) as VendorStore[]);
}

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
