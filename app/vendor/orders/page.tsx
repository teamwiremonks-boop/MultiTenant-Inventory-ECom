import { Suspense } from "react";

import { VendorOrdersWorkspace } from "@/components/vendor/orders-workspace";
import { PageHeader } from "@/components/vendor/page-header";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { listVendorOrders } from "@/lib/actions/vendor/orders";

export default function VendorOrdersPage() {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <VendorOrdersContent />
    </Suspense>
  );
}

async function VendorOrdersContent() {
  const result = await listVendorOrders();
  const orders = result.ok ? result.data : [];

  return (
    <div>
      <PageHeader
        description="Review reserved stock, select store allocation, and move orders through fulfillment."
        title="Orders"
      />
      {!result.ok && (
        <p className="mb-4 text-sm text-destructive">{result.error.message}</p>
      )}
      <VendorOrdersWorkspace initialOrders={orders as Array<Record<string, unknown>>} />
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div>
      <PageHeader
        description="Review reserved stock, select store allocation, and move orders through fulfillment."
        title="Orders"
      />
      <Card className="rounded-lg">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading orders...
        </CardContent>
      </Card>
    </div>
  );
}
