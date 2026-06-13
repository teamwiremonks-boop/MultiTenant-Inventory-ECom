import { Suspense } from "react";

import { PageHeader } from "@/components/vendor/page-header";
import { InventoryWorkspace } from "@/components/vendor/inventory-workspace";
import { StoreManager } from "@/components/vendor/store-manager";

export default function VendorStoresPage() {
  return (
    <div>
      <PageHeader
        description="Create and update fulfillment locations when the vendor account is active."
        title="Stores"
      />
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading stores...</p>}
      >
        <StoreManager />
      </Suspense>
      <InventoryWorkspace />
    </div>
  );
}
