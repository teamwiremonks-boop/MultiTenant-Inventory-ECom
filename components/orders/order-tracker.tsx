"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackOrder } from "@/lib/actions/customer/orders";

type OrderTrackerProps = {
  orderId: string;
  initialData: Record<string, unknown>;
};

export function OrderTracker({ orderId, initialData }: OrderTrackerProps) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const result = await trackOrder({ orderId });
      if (!active) return;
      if (result.ok) {
        setData(result.data as Record<string, unknown>);
        setError(null);
      } else {
        setError(result.error.message);
      }
    };
    const interval = window.setInterval(load, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [orderId]);

  const order = (data.order ?? {}) as Record<string, unknown>;
  const vendorOrders = Array.isArray(data.vendorOrders) ? data.vendorOrders : [];

  return (
    <div className="grid gap-6">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>Order {String(order.orderNumber ?? "")}</span>
            <Badge variant="secondary">{String(order.status ?? "placed")}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          {vendorOrders.map((vendorOrder) => {
            const row = vendorOrder as Record<string, unknown>;
            const items = Array.isArray(row.items) ? row.items : [];
            return (
              <div className="rounded-md border p-3" key={String(row.id)}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">Vendor order</p>
                  <Badge>{String(row.status ?? "")}</Badge>
                </div>
                <div className="mt-3 grid gap-2">
                  {items.map((item) => {
                    const line = item as Record<string, unknown>;
                    return (
                      <div
                        className="flex items-center justify-between gap-3 text-muted-foreground"
                        key={String(line.id)}
                      >
                        <span>{String(line.productName ?? "Product")}</span>
                        <span>Qty {String(line.quantity ?? 0)}</span>
                      </div>
                    );
                  })}
                </div>
                {row.vendorNote ? (
                  <p className="mt-3 text-muted-foreground">
                    Note: {String(row.vendorNote)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
