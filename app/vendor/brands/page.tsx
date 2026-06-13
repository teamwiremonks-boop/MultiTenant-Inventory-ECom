import { Suspense } from "react";

import { BrandManager } from "@/components/vendor/brand-manager";
import { PageHeader } from "@/components/vendor/page-header";

export default function VendorBrandsPage() {
  return (
    <div>
      <PageHeader
        description="Manage brand containers for product organization and catalog browsing."
        title="Brands"
      />
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading brands...</p>}
      >
        <BrandManager />
      </Suspense>
    </div>
  );
}
