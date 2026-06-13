"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { deleteBrand, updateBrandActive } from "@/lib/actions/vendor/brands";
import {
  useVendorCatalog,
  vendorCatalogActions,
} from "@/lib/stores/vendor-catalog";
import { statusLabel, type VendorBrand } from "@/lib/vendor-data";

type BrandListProps = {
  filter?: string;
  onDeleted?: () => void;
  onEdit?: (brand: VendorBrand) => void;
  refreshKey?: number;
};

export function BrandList({
  filter = "",
  onDeleted,
  onEdit,
  refreshKey = 0,
}: BrandListProps) {
  const searchParams = useSearchParams();
  const activeFilter = filter || searchParams.get("brand") || "";
  const brands = useVendorCatalog((state) => state.brands);
  const error = useVendorCatalog((state) => state.error);
  const loaded = useVendorCatalog((state) => state.loaded);
  const loading = useVendorCatalog((state) => state.loading);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleDelete(brand: VendorBrand) {
    if (
      !window.confirm(
        `Delete ${brand.name}? This will mark the brand inactive.`,
      )
    ) {
      return;
    }

    setDeletingId(brand.id);
    const result = await deleteBrand({ id: brand.id });
    setDeletingId(null);

    if (result.ok) {
      await vendorCatalogActions.refreshBrands();
      onDeleted?.();
    } else {
      window.alert(result.error.message);
    }
  }

  async function handleStatusChange(brand: VendorBrand, isActive: boolean) {
    setUpdatingId(brand.id);
    const result = await updateBrandActive({
      id: brand.id,
      name: brand.name,
      description: brand.description ?? "",
      logoUrls: brand.logoUrls ?? brand.logo_urls ?? [],
      isActive,
    });
    setUpdatingId(null);

    if (result.ok) {
      await vendorCatalogActions.refreshBrands();
    } else {
      window.alert(result.error.message);
    }
  }

  useEffect(() => {
    if (refreshKey > 0) {
      void vendorCatalogActions.refreshBrands();
      return;
    }

    void vendorCatalogActions.loadCatalog();
  }, [refreshKey]);

  const filteredBrands = useMemo(() => {
    const needle = activeFilter.toLowerCase();
    if (!needle) return brands;
    return brands.filter((brand) => brand.name.toLowerCase().includes(needle));
  }, [brands, activeFilter]);

  if (loading && !loaded) {
    return <p className="text-sm text-muted-foreground">Loading brands...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Brand</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredBrands.length === 0 ? (
          <TableRow>
            <TableCell className="text-muted-foreground" colSpan={3}>
              No brands found.
            </TableCell>
          </TableRow>
        ) : (
          filteredBrands.map((brand) => (
            <TableRow
              className="cursor-pointer"
              key={brand.id}
              onClick={() => onEdit?.(brand)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <EntityThumbnail
                    alt={`${brand.name} logo`}
                    url={(brand.logoUrls ?? brand.logo_urls ?? [])[0]}
                  />
                  <div className="min-w-0">
                    <div className="font-medium">{brand.name}</div>
                    {brand.description && (
                      <div className="line-clamp-1 text-sm text-muted-foreground">
                        {brand.description}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {brand.platform_status && brand.platform_status !== "active" ? (
                  <Badge variant="secondary">{statusLabel(brand)}</Badge>
                ) : (
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                    disabled={updatingId === brand.id}
                    onChange={(event) =>
                      handleStatusChange(brand, event.target.value === "active")
                    }
                    onClick={(event) => event.stopPropagation()}
                    value={statusLabel(brand)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit?.(brand);
                    }}
                    onMouseDown={(event) => event.stopPropagation()}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Edit
                  </Button>
                  <Button
                    disabled={deletingId === brand.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(brand);
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
