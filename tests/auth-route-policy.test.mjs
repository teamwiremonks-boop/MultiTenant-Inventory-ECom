import assert from "node:assert/strict";
import { test } from "node:test";

import { cacheControlForRoute, isPublicRoute } from "../lib/auth-route-policy.mjs";

test("isPublicRoute allows auth and business signup routes only", () => {
  assert.equal(isPublicRoute("/"), true);
  assert.equal(isPublicRoute("/auth/login"), true);
  assert.equal(isPublicRoute("/business/sign-up"), true);
  assert.equal(isPublicRoute("/checkout"), true);
  assert.equal(isPublicRoute("/products/product-1"), true);
  assert.equal(isPublicRoute("/vendor/dashboard"), false);
  assert.equal(isPublicRoute("/orders"), false);
});

test("cacheControlForRoute prevents browser history cache on protected routes", () => {
  assert.equal(cacheControlForRoute("/auth/login"), undefined);
  assert.equal(
    cacheControlForRoute("/vendor/dashboard"),
    "no-store, max-age=0, must-revalidate",
  );
});
