export type ActionError = {
  code: string;
  message: string;
  details?: string;
};

export type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: ActionError;
    };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(
  code: string,
  message: string,
  details?: unknown,
): ActionResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      details: stringifyDetails(details),
    },
  };
}

export function mapSupabaseError(error: {
  code?: string;
  message?: string;
  details?: unknown;
}): ActionResult<never> {
  return fail(
    error.code ?? "SUPABASE_ERROR",
    error.message ?? "Supabase request failed.",
    error.details,
  );
}

function stringifyDetails(details: unknown) {
  if (details === undefined || details === null) {
    return undefined;
  }

  if (typeof details === "string") {
    return details;
  }

  if (details instanceof Error) {
    return details.message;
  }

  try {
    return JSON.stringify(details);
  } catch {
    return "Additional error details were not serializable.";
  }
}
