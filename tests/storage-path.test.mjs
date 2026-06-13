import assert from "node:assert/strict";
import { test } from "node:test";

import { buildPublicAssetPath } from "../lib/supabase/storage-path.mjs";

test("buildPublicAssetPath stores brand images under the authorized vendor folder", () => {
  const path = buildPublicAssetPath({
    folder: "brand",
    fileName: "My Logo.PNG",
    vendorId: "vendor-123",
    id: "upload-1",
  });

  assert.equal(path, "vendors/vendor-123/brand/upload-1-my-logo.png");
});

test("buildPublicAssetPath stores store images under the authorized vendor folder", () => {
  const path = buildPublicAssetPath({
    folder: "stores",
    fileName: "Main Store.JPG",
    vendorId: "vendor-456",
    id: "upload-2",
  });

  assert.equal(path, "vendors/vendor-456/stores/upload-2-main-store.jpg");
});
