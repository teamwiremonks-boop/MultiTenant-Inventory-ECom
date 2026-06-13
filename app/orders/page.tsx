import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCustomerOrders } from "@/lib/actions/customer/orders";

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </main>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}

async function OrdersContent() {
  const result = await listCustomerOrders();
  const orders = result.ok ? result.data : [];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">
        <div>
          <Button asChild variant="ghost">
            <Link href="/">Back to shop</Link>
          </Button>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Current and past customer orders.
          </p>
        </div>
        {!result.ok && <p className="text-sm text-destructive">{result.error.message}</p>}
        <Card>
          <CardHeader>
            <CardTitle>Order history</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              orders.map((order) => (
                <div className="flex items-center justify-between gap-3 rounded-md border p-3" key={order.id}>
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{order.status}</Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/orders/${order.id}`}>Track</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
