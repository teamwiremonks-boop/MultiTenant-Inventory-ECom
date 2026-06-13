"use client";

import { useState } from "react";

import { StoreForm } from "@/components/vendor/store-form";
import { StoreList } from "@/components/vendor/store-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StoreValues } from "@/lib/schemas/vendor";
import { storeRowToFormValues } from "@/lib/vendor-edit-mappers.mjs";

type StoreFormState = Partial<StoreValues> & { id?: string };

export function StoreManager() {
  const [selectedStore, setSelectedStore] = useState<StoreFormState | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSaved() {
    setRefreshKey((key) => key + 1);
  }

  function clearSelection() {
    setSelectedStore(undefined);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Store list</CardTitle>
          <CardDescription>
            Saved stores appear here and can be edited by active vendors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreList
            onDeleted={handleSaved}
            onEdit={(store) => setSelectedStore(storeRowToFormValues(store))}
            refreshKey={refreshKey}
          />
        </CardContent>
      </Card>
      <Card className="rounded-lg">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{selectedStore?.id ? "Edit store" : "Add store"}</CardTitle>
            <CardDescription>
              Store changes are blocked by backend RPCs if the vendor is suspended.
            </CardDescription>
          </div>
          {selectedStore?.id && (
            <Button onClick={clearSelection} size="sm" type="button" variant="outline">
              New
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <StoreForm
            initialValues={selectedStore}
            mode={selectedStore?.id ? "update" : "create"}
            onSaved={handleSaved}
          />
        </CardContent>
      </Card>
    </div>
  );
}
