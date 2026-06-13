import { OrderStatusForm } from "@/components/vendor/order-status-form";
import { PageHeader } from "@/components/vendor/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getVendorOrder } from "@/lib/actions/vendor/orders";
import { Suspense } from "react";

export default function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div>
          <PageHeader
            description="Order item details should use checkout snapshots, even when catalog data changes later."
            title="Order detail"
          />
          <Card className="rounded-lg">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading order...
            </CardContent>
          </Card>
        </div>
      }
    >
      <VendorOrderDetailContent params={params} />
    </Suspense>
  );
}

async function VendorOrderDetailContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const result = await getVendorOrder({ vendorOrderId: orderId });

  if (!result.ok) {
    return (
      <div>
        <PageHeader
          description="Order item details should use checkout snapshots, even when catalog data changes later."
          title="Order detail"
        />
        <Card className="rounded-lg">
          <CardContent className="p-6 text-sm text-destructive">
            {result.error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = result.data as {
    tracking: { vendorOrders?: Array<Record<string, unknown>> };
    vendorOrder: Record<string, unknown>;
  };
  const vendorOrder =
    data.tracking.vendorOrders?.find((row) => row.id === orderId) ??
    data.vendorOrder;
  const items = Array.isArray(vendorOrder.items) ? vendorOrder.items : [];
  const currentStatus = String(vendorOrder.status ?? data.vendorOrder.status ?? "placed");

  return (
    <div>
      <PageHeader
        badge={currentStatus}
        description="Order item details use checkout snapshots, even when catalog data changes later."
        title="Order detail"
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Items</CardTitle>
            <CardDescription>
              Product names, SKU, and variant selections are shown from the
              order snapshot.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {items.length === 0 ? (
              <p className="text-muted-foreground">No order items loaded.</p>
            ) : (
              items.map((item) => {
                const row = item as Record<string, unknown>;
                return (
                  <div
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                    key={String(row.id)}
                  >
                    <div>
                      <p className="font-medium">{String(row.productName ?? "Product")}</p>
                      <p className="text-muted-foreground">
                        SKU {String(row.sku ?? "-")} · Qty {String(row.quantity ?? 0)}
                      </p>
                    </div>
                    <Badge variant="secondary">{String(row.status ?? "")}</Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Update fulfillment</CardTitle>
            <CardDescription>
              Customers see the latest status on their tracking page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderStatusForm
              currentStatus={currentStatus}
              readOnly={!canUpdateStatus(currentStatus)}
              vendorOrderId={orderId}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function canUpdateStatus(status: string) {
  return ["placed", "accepted", "packed", "shipped"].includes(status);
}
