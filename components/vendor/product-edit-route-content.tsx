"use client";

import { useParams } from "next/navigation";

import { ProductEditLoader } from "@/components/vendor/product-edit-loader";

export function ProductEditRouteContent() {
  const params = useParams<{ productId: string }>();

  return <ProductEditLoader productId={params.productId} />;
}
