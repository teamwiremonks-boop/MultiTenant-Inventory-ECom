import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";

import { PageHeader } from "@/components/vendor/page-header";
import { ProductList } from "@/components/vendor/product-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VendorProductsPage() {
  return (
    <div>
      <PageHeader
        description="Manage product records, variants, SKU inventory, and catalog visibility."
        title="Products"
      >
        <Button asChild>
          <Link href="/vendor/products/new">
            <Plus className="size-4" />
            New product
          </Link>
        </Button>
      </PageHeader>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Product catalog</CardTitle>
          <CardDescription>
            Active vendors can create and edit products. Suspended vendors keep
            read-only access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Loading products...</p>
            }
          >
            <ProductList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
