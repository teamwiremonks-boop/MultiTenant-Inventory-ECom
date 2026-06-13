import assert from "node:assert/strict";
import { test } from "node:test";

import { safeNextPath } from "../lib/redirect-safety.mjs";

test("safeNextPath allows local paths only", () => {
  assert.equal(safeNextPath("/checkout", "/vendor/dashboard"), "/checkout");
  assert.equal(safeNextPath("https://evil.example", "/vendor/dashboard"), "/vendor/dashboard");
  assert.equal(safeNextPath("//evil.example", "/vendor/dashboard"), "/vendor/dashboard");
  assert.equal(safeNextPath("", "/vendor/dashboard"), "/vendor/dashboard");
});
