import { getServerSupabaseClient } from "./auth";
import { mapSupabaseError, ok, type ActionResult } from "./results";

export type RpcPayload = Record<string, unknown>;

export async function callRpc<TData = unknown>(
  functionName: string,
  payload?: RpcPayload,
): Promise<ActionResult<TData>> {
  const supabase = await getServerSupabaseClient();
  const args = payload === undefined ? undefined : { payload };
  const { data, error } = await supabase.rpc(functionName, args);

  if (error) {
    return mapSupabaseError(error);
  }

  return ok(data as TData);
}
