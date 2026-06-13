import assert from "node:assert/strict";
import { test } from "node:test";

import { buildBrandMutationPayload } from "../lib/brand-payload.mjs";

test("buildBrandMutationPayload maps create form values to the save_brand contract", () => {
  assert.deepEqual(
    buildBrandMutationPayload({
      values: {
        name: "Vendor Brand",
        description: "Seasonal",
        logoUrls: ["https://example.com/logo.png"],
        isActive: true,
      },
    }),
    {
      name: "Vendor Brand",
      description: "Seasonal",
      logoUrls: ["https://example.com/logo.png"],
      isActive: true,
    },
  );
});

test("buildBrandMutationPayload maps edit form values with the RPC-supported id key", () => {
  assert.deepEqual(
    buildBrandMutationPayload({
      id: "brand-1",
      values: {
        name: "Vendor Brand",
        description: "",
        logoUrls: [],
        isActive: false,
      },
    }),
    {
      id: "brand-1",
      name: "Vendor Brand",
      description: "",
      logoUrls: [],
      isActive: false,
    },
  );
});
