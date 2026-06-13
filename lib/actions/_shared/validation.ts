import { fail, type ActionResult } from "./results";

type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function requireRecord(
  value: unknown,
  label = "payload",
): ActionResult<UnknownRecord> {
  if (!isRecord(value)) {
    return fail("INVALID_PAYLOAD", `${label} must be an object.`);
  }

  return { ok: true, data: value };
}

export function requireNonEmptyString(
  value: unknown,
  fieldName: string,
): ActionResult<string> {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fail("INVALID_FIELD", `${fieldName} is required.`);
  }

  return { ok: true, data: value.trim() };
}

export function requireOptionalString(
  value: unknown,
  fieldName: string,
): ActionResult<string | undefined> {
  if (value === undefined || value === null || value === "") {
    return { ok: true, data: undefined };
  }

  if (typeof value !== "string") {
    return fail("INVALID_FIELD", `${fieldName} must be text.`);
  }

  return { ok: true, data: value.trim() };
}

export function requireStringArray(
  value: unknown,
  fieldName: string,
): ActionResult<string[]> {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return fail("INVALID_FIELD", `${fieldName} must be a list of text values.`);
  }

  return { ok: true, data: value.map((item) => item.trim()) };
}

export function requireStatus<TStatus extends string>(
  value: unknown,
  fieldName: string,
  allowedStatuses: readonly TStatus[],
): ActionResult<TStatus> {
  if (
    typeof value !== "string" ||
    !allowedStatuses.includes(value as TStatus)
  ) {
    return fail(
      "INVALID_STATUS",
      `${fieldName} must be one of: ${allowedStatuses.join(", ")}.`,
    );
  }

  return { ok: true, data: value as TStatus };
}

export function unwrapPayload(
  input: unknown,
): ActionResult<Record<string, unknown>> {
  const record = requireRecord(input);
  if (!record.ok) return record;

  if ("payload" in record.data) {
    return requireRecord(record.data.payload, "payload");
  }

  return record;
}
