import { Suspense } from "react";

import { ProductEditRouteContent } from "@/components/vendor/product-edit-route-content";
import { PageHeader } from "@/components/vendor/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EditVendorProductPage() {
  return (
    <div>
      <PageHeader
        description="Edit product and SKU details when the vendor account is active."
        title="Edit product"
      />
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>
            Option groups, SKU rows, media, and store inventory are loaded from
            the product RPC.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Loading product...</p>
            }
          >
            <ProductEditRouteContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
