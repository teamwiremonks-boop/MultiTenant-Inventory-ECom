"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { EntityThumbnail } from "@/components/vendor/entity-thumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProducts } from "@/lib/actions/vendor/products";
import { deleteProduct, updateProductActive } from "@/lib/actions/vendor/products";
import { asArray, statusLabel, type VendorProduct } from "@/lib/vendor-data";

type ProductListProps = {
  brandFilter?: string;
  productFilter?: string;
};

export function ProductList({
  brandFilter = "",
  productFilter = "",
}: ProductListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeBrandFilter = brandFilter || searchParams.get("brand") || "";
  const activeProductFilter =
    productFilter || searchParams.get("product") || "";
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleDelete(product: VendorProduct) {
    if (
      !window.confirm(
        `Delete ${product.name}? This will remove it from the active product catalog.`,
      )
    ) {
      return;
    }

    setDeletingId(product.id);
    const result = await deleteProduct({ productId: product.id });
    setDeletingId(null);

    if (result.ok) {
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      setError(null);
    } else {
      setError(result.error.message);
    }
  }

  async function handleStatusChange(product: VendorProduct, isActive: boolean) {
    setUpdatingId(product.id);
    const result = await updateProductActive({
      productId: product.id,
      isActive,
    });
    setUpdatingId(null);

    if (result.ok) {
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, isActive, is_active: isActive }
            : item,
        ),
      );
      setError(null);
    } else {
      setError(result.error.message);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      const result = await getProducts({
        brand: activeBrandFilter,
        search: activeProductFilter,
      });
      if (!mounted) return;

      if (result.ok) {
        setProducts(asArray<VendorProduct>(result.data));
        setError(null);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [activeBrandFilter, activeProductFilter]);

  const filteredProducts = useMemo(() => {
    const productNeedle = activeProductFilter.toLowerCase();
    const brandNeedle = activeBrandFilter.toLowerCase();

    return products.filter((product) => {
      const matchesProduct =
        !productNeedle || product.name.toLowerCase().includes(productNeedle);
      const brandName = product.brand_name ?? product.brand_id ?? "";
      const matchesBrand =
        !brandNeedle || brandName.toLowerCase().includes(brandNeedle);

      return matchesProduct && matchesBrand;
    });
  }, [activeBrandFilter, activeProductFilter, products]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading products...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredProducts.length === 0 ? (
          <TableRow>
            <TableCell className="text-muted-foreground" colSpan={4}>
              No products found.
            </TableCell>
          </TableRow>
        ) : (
          filteredProducts.map((product) => (
            <TableRow
              className="cursor-pointer"
              key={product.id}
              onClick={() => router.push(`/vendor/products/${product.id}/edit`)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <EntityThumbnail
                    alt={`${product.name} image`}
                    url={
                      (
                        product.productImages ??
                        product.product_images ??
                        product.imageUrls ??
                        product.image_urls ??
                        []
                      )[0]
                    }
                  />
                  <div className="min-w-0">
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="line-clamp-1 text-sm text-muted-foreground">
                        {product.description}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {product.brandName ?? product.brand_name ?? product.brand_id ?? "-"}
              </TableCell>
              <TableCell>
                {product.platform_status && product.platform_status !== "active" ? (
                  <Badge variant="secondary">{statusLabel(product)}</Badge>
                ) : (
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                    disabled={updatingId === product.id}
                    onChange={(event) =>
                      handleStatusChange(product, event.target.value === "active")
                    }
                    onClick={(event) => event.stopPropagation()}
                    value={statusLabel(product)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    asChild
                    onMouseDown={(event) => event.stopPropagation()}
                    size="sm"
                    variant="outline"
                  >
                    <Link
                      href={`/vendor/products/${product.id}/edit`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      Edit
                    </Link>
                  </Button>
                  <Button
                    disabled={deletingId === product.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(product);
                    }}
                    onMouseDown={(event) => event.stopPropagation()}
                    size="icon"
                    type="button"
                    variant="destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
