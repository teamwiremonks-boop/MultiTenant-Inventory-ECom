import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "./results";

export async function getServerSupabaseClient() {
  return createClient();
}

export async function requireAuthenticatedUser(): Promise<
  ActionResult<{ id: string; email?: string }>
> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return fail("UNAUTHENTICATED", "Please sign in to continue.", error?.message);
  }

  return ok({
    id: data.user.id,
    email: data.user.email,
  });
}
