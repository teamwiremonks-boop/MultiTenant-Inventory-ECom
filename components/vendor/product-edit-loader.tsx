"use client";

import { useEffect, useState } from "react";

import { ActionMessage } from "@/components/vendor/action-message";
import { ProductForm } from "@/components/vendor/product-form";
import { getProduct } from "@/lib/actions/vendor/products";
import type { ProductValues } from "@/lib/schemas/vendor";
import { productResponseToFormValues } from "@/lib/product-builder.mjs";

type ProductEditLoaderProps = {
  productId: string;
};

export function ProductEditLoader({ productId }: ProductEditLoaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<
    (ProductValues & { id?: string }) | null
  >(null);

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      const result = await getProduct({ productId });
      if (!mounted) return;

      if (result.ok) {
        setInitialValues(
          productResponseToFormValues(
            result.data as Record<string, unknown>,
          ) as ProductValues & { id?: string },
        );
        setError(null);
      } else {
        setError(result.error.message);
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [productId]);

  if (error) {
    return <ActionMessage message={error} type="error" />;
  }

  if (!initialValues) {
    return <p className="text-sm text-muted-foreground">Loading product...</p>;
  }

  return <ProductForm initialValues={initialValues} />;
}
