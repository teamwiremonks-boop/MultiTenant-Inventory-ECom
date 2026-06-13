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
import { deleteStore, updateStoreActive } from "@/lib/actions/vendor/stores";
import {
  useVendorCatalog,
  vendorCatalogActions,
} from "@/lib/stores/vendor-catalog";
import { statusLabel, type VendorStore } from "@/lib/vendor-data";

type StoreListProps = {
  filter?: string;
  onDeleted?: () => void;
  onEdit?: (store: VendorStore) => void;
  refreshKey?: number;
};

export function StoreList({
  filter = "",
  onDeleted,
  onEdit,
  refreshKey = 0,
}: StoreListProps) {
  const searchParams = useSearchParams();
  const activeFilter = filter || searchParams.get("store") || "";
  const stores = useVendorCatalog((state) => state.stores);
  const error = useVendorCatalog((state) => state.error);
  const loaded = useVendorCatalog((state) => state.loaded);
  const loading = useVendorCatalog((state) => state.loading);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleDelete(store: VendorStore) {
    if (
      !window.confirm(
        `Delete ${store.name}? This will mark the store inactive.`,
      )
    ) {
      return;
    }

    setDeletingId(store.id);
    const result = await deleteStore({ id: store.id });
    setDeletingId(null);

    if (result.ok) {
      await vendorCatalogActions.refreshStores();
      onDeleted?.();
    } else {
      window.alert(result.error.message);
    }
  }

  async function handleStatusChange(store: VendorStore, isActive: boolean) {
    setUpdatingId(store.id);
    const result = await updateStoreActive({
      id: store.id,
      name: store.name,
      address:
        store.address ||
        [store.address_line1, store.city, store.state].filter(Boolean).join(", "),
      imageUrls: store.imageUrls ?? store.image_urls ?? [],
      isActive,
    });
    setUpdatingId(null);

    if (result.ok) {
      await vendorCatalogActions.refreshStores();
    } else {
      window.alert(result.error.message);
    }
  }

  useEffect(() => {
    if (refreshKey > 0) {
      void vendorCatalogActions.refreshStores();
      return;
    }

    void vendorCatalogActions.loadCatalog();
  }, [refreshKey]);

  const filteredStores = useMemo(() => {
    const needle = activeFilter.toLowerCase();
    if (!needle) return stores;
    return stores.filter((store) => store.name.toLowerCase().includes(needle));
  }, [stores, activeFilter]);

  if (loading && !loaded) {
    return <p className="text-sm text-muted-foreground">Loading stores...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Store</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredStores.length === 0 ? (
          <TableRow>
            <TableCell className="text-muted-foreground" colSpan={4}>
              No stores found.
            </TableCell>
          </TableRow>
        ) : (
          filteredStores.map((store) => (
            <TableRow
              className="cursor-pointer"
              key={store.id}
              onClick={() => onEdit?.(store)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <EntityThumbnail
                    alt={`${store.name} image`}
                    url={(store.imageUrls ?? store.image_urls ?? [])[0]}
                  />
                  <div className="font-medium">{store.name}</div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {store.address ||
                  [store.city, store.state].filter(Boolean).join(", ") ||
                  "-"}
              </TableCell>
              <TableCell>
                {store.platform_status && store.platform_status !== "active" ? (
                  <Badge variant="secondary">{statusLabel(store)}</Badge>
                ) : (
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                    disabled={updatingId === store.id}
                    onChange={(event) =>
                      handleStatusChange(store, event.target.value === "active")
                    }
                    onClick={(event) => event.stopPropagation()}
                    value={statusLabel(store)}
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
                      onEdit?.(store);
                    }}
                    onMouseDown={(event) => event.stopPropagation()}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Edit
                  </Button>
                  <Button
                    disabled={deletingId === store.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(store);
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
