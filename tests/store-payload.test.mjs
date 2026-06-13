import assert from "node:assert/strict";
import { test } from "node:test";

import { buildStoreMutationPayload } from "../lib/store-payload.mjs";

test("buildStoreMutationPayload maps create form values to the store RPC contract", () => {
  const payload = buildStoreMutationPayload({
    values: {
      name: "Main Store",
      address: "221B Baker Street",
      imageUrls: ["https://example.com/store.png"],
      is_active: false,
    },
  });

  assert.deepEqual(payload, {
    name: "Main Store",
    address: "221B Baker Street",
    imageUrls: ["https://example.com/store.png"],
    isActive: false,
  });
});

test("buildStoreMutationPayload maps update form values to the store RPC contract", () => {
  const payload = buildStoreMutationPayload({
    storeId: "store-123",
    values: {
      name: "Main Store",
      address: "221B Baker Street",
      imageUrls: [],
      is_active: true,
    },
  });

  assert.deepEqual(payload, {
    id: "store-123",
    name: "Main Store",
    address: "221B Baker Street",
    imageUrls: [],
    isActive: true,
  });
});
