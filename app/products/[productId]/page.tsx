import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductDetailClient } from "@/components/storefront/product-detail-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPublicProduct } from "@/lib/actions/guest/catalog";
import { publicProductToDetail } from "@/lib/storefront-products";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <p className="text-sm text-muted-foreground">Loading product...</p>
        </main>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}

async function ProductDetailContent({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  if (!productId) notFound();

  const result = await getPublicProduct({ productId });
  if (!result.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Alert className="max-w-xl">
          <AlertTitle>Product unavailable</AlertTitle>
          <AlertDescription>{result.error.message}</AlertDescription>
        </Alert>
      </main>
    );
  }

  const product = publicProductToDetail(result.data as Record<string, unknown>);
  return <ProductDetailClient product={product} />;
}
