import assert from "node:assert/strict";
import { test } from "node:test";

import { postLogoutNavigation } from "../lib/logout-navigation.mjs";

test("postLogoutNavigation replaces protected history without pre-refreshing it", () => {
  assert.deepEqual(postLogoutNavigation(), {
    href: "/auth/login",
    replaceHistory: true,
    refreshBeforeNavigate: false,
  });
});
