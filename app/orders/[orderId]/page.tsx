import Link from "next/link";
import { Suspense } from "react";

import { OrderTracker } from "@/components/orders/order-tracker";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trackOrder } from "@/lib/actions/customer/orders";

export default function OrderTrackPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <p className="text-sm text-muted-foreground">Loading order...</p>
        </main>
      }
    >
      <OrderTrackContent params={params} />
    </Suspense>
  );
}

async function OrderTrackContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const result = await trackOrder({ orderId });

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">
        <Button asChild className="w-fit" variant="ghost">
          <Link href="/orders">Back to orders</Link>
        </Button>
        {!result.ok ? (
          <Alert>
            <AlertTitle>Order unavailable</AlertTitle>
            <AlertDescription>{result.error.message}</AlertDescription>
          </Alert>
        ) : (
          <OrderTracker
            initialData={result.data as Record<string, unknown>}
            orderId={orderId}
          />
        )}
      </div>
    </main>
  );
}
