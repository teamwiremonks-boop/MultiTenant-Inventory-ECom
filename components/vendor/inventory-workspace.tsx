"use client";

import { useEffect, useMemo, useState } from "react";

import { ActionMessage } from "@/components/vendor/action-message";
import { SuspensionBanner } from "@/components/vendor/suspension-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProduct, getProducts, saveProduct } from "@/lib/actions/vendor/products";
import {
  buildProductMutationPayload,
  productResponseToFormValues,
} from "@/lib/product-builder.mjs";
import type { ProductValues } from "@/lib/schemas/vendor";
import {
  useVendorCatalog,
  vendorCatalogActions,
} from "@/lib/stores/vendor-catalog";
import {
  inventoryTotalForStore,
  setVariantInventoryQuantity,
  variantOptionText,
} from "@/lib/vendor-inventory";
import {
  asArray,
  statusLabel,
  type VendorProduct,
  type VendorStore,
} from "@/lib/vendor-data";

type InventoryProduct = ProductValues & { id: string };

function quantityForStore(
  variant: ProductValues["variants"][number],
  storeId: string,
) {
  return variant.inventory.find((row) => row.storeId === storeId)?.quantity ?? 0;
}

function inventoryTotalForVariant(variant: ProductValues["variants"][number]) {
  return variant.inventory.reduce((total, row) => total + row.quantity, 0);
}

function isStoreActive(store: VendorStore) {
  return statusLabel(store) === "active";
}

export function InventoryWorkspace() {
  const stores = useVendorCatalog((state) => state.stores);
  const workspace = useVendorCatalog((state) => state.workspace);
  const catalogError = useVendorCatalog((state) => state.error);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      const [, result] = await Promise.all([
        vendorCatalogActions.loadCatalog(),
        getProducts(),
      ]);
      if (!mounted) return;

      if (result.ok) {
        const rows = asArray<VendorProduct>(result.data);
        setProducts(rows);
        setSelectedProductId((current) => current || rows[0]?.id || "");
      } else {
        setMessage({ type: "error", text: result.error.message });
      }
      setLoadingProducts(false);
    }

    void loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      if (!selectedProductId) {
        setProduct(null);
        return;
      }

      setLoadingProduct(true);
      setMessage(null);
      const result = await getProduct({ productId: selectedProductId });
      if (!mounted) return;

      if (result.ok) {
        setProduct(
          productResponseToFormValues(
            result.data as Record<string, unknown>,
          ) as InventoryProduct,
        );
      } else {
        setProduct(null);
        setMessage({ type: "error", text: result.error.message });
      }
      setLoadingProduct(false);
    }

    void loadProduct();
    return () => {
      mounted = false;
    };
  }, [selectedProductId]);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedProductId),
    [products, selectedProductId],
  );
  const grandTotal = product
    ? product.variants.reduce(
        (total, variant) => total + inventoryTotalForVariant(variant),
        0,
      )
    : 0;
  const suspended = workspace?.isSuspended === true;

  function updateQuantity(variantId: string, storeId: string, quantity: number) {
    setProduct((current) =>
      current
        ? (setVariantInventoryQuantity(current, {
            quantity: Math.max(0, Math.floor(quantity || 0)),
            storeId,
            variantId,
          }) as InventoryProduct)
        : current,
    );
    setMessage(null);
  }

  async function handleSave() {
    if (!product || suspended) return;

    setSaving(true);
    setMessage(null);
    const result = await saveProduct(buildProductMutationPayload(product));
    setSaving(false);
    setMessage(
      result.ok
        ? { type: "success", text: "Inventory saved." }
        : { type: "error", text: result.error.message },
    );
  }

  return (
    <Card className="mt-6 rounded-lg">
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
        <CardDescription>
          Choose a product, update stock by store, then save all inventory changes
          together.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <SuspensionBanner suspended={suspended} />

        <div className="max-w-xl space-y-2">
          <Label htmlFor="inventory-product">Product</Label>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loadingProducts}
            id="inventory-product"
            onChange={(event) => setSelectedProductId(event.target.value)}
            value={selectedProductId}
          >
            <option value="">Select a product</option>
            {products.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {statusLabel(item) === "active" ? "" : " (inactive)"}
              </option>
            ))}
          </select>
        </div>

        {catalogError && (
          <ActionMessage message={catalogError} type="error" />
        )}
        {message && <ActionMessage message={message.text} type={message.type} />}

        {loadingProducts || loadingProduct ? (
          <p className="text-sm text-muted-foreground">Loading inventory...</p>
        ) : !selectedProductId ? (
          <p className="text-sm text-muted-foreground">
            Select a product to manage its inventory.
          </p>
        ) : !product ? null : stores.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a store before assigning inventory.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{product.name}</span>
              {selectedProduct && statusLabel(selectedProduct) !== "active" && (
                <Badge variant="outline">Inactive product</Badge>
              )}
              <span className="text-muted-foreground">
                {product.variants.length} variant
                {product.variants.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-52">Variant</TableHead>
                    {stores.map((store) => (
                      <TableHead className="min-w-36" key={store.id}>
                        <div className="flex items-center gap-2">
                          <span>{store.name}</span>
                          {!isStoreActive(store) && (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.variants.map((variant) => {
                    const variantInactive = variant.isActive === false;

                    return (
                      <TableRow key={variant.id ?? variant.sku}>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">
                              {variantOptionText(variant.attributes)}
                            </span>
                            {variantInactive && (
                              <Badge variant="outline">Inactive SKU</Badge>
                            )}
                          </div>
                        </TableCell>
                        {stores.map((store) => {
                          const readOnly =
                            suspended || variantInactive || !isStoreActive(store);

                          return (
                            <TableCell key={store.id}>
                              <Input
                                aria-label={`${product.name}, ${variantOptionText(variant.attributes)}, ${store.name}`}
                                className="w-28"
                                disabled={readOnly}
                                min="0"
                                onChange={(event) =>
                                  updateQuantity(
                                    variant.id ?? "",
                                    store.id,
                                    Number(event.target.value),
                                  )
                                }
                                step="1"
                                type="number"
                                value={quantityForStore(variant, store.id)}
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-medium">
                          {inventoryTotalForVariant(variant)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-muted/40 font-medium hover:bg-muted/40">
                    <TableCell>Total</TableCell>
                    {stores.map((store) => (
                      <TableCell key={store.id}>
                        {inventoryTotalForStore(product, store.id)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">{grandTotal}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Button
                disabled={saving || suspended}
                onClick={handleSave}
                type="button"
              >
                {saving ? "Saving..." : "Save inventory"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
