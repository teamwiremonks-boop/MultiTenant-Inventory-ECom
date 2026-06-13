"use client";

import { useState } from "react";

import { BrandForm } from "@/components/vendor/brand-form";
import { BrandList } from "@/components/vendor/brand-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BrandValues } from "@/lib/schemas/vendor";
import { brandRowToFormValues } from "@/lib/vendor-edit-mappers.mjs";

type BrandFormState = Partial<BrandValues> & { id?: string };

export function BrandManager() {
  const [selectedBrand, setSelectedBrand] = useState<BrandFormState | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSaved() {
    setRefreshKey((key) => key + 1);
  }

  function clearSelection() {
    setSelectedBrand(undefined);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Brand list</CardTitle>
          <CardDescription>
            Saved brands appear here and can be edited by active vendors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandList
            onDeleted={handleSaved}
            onEdit={(brand) => setSelectedBrand(brandRowToFormValues(brand))}
            refreshKey={refreshKey}
          />
        </CardContent>
      </Card>
      <Card className="rounded-lg">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{selectedBrand?.id ? "Edit brand" : "Add brand"}</CardTitle>
            <CardDescription>
              Suspended vendors can view brands but cannot save changes.
            </CardDescription>
          </div>
          {selectedBrand?.id && (
            <Button onClick={clearSelection} size="sm" type="button" variant="outline">
              New
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <BrandForm initialValues={selectedBrand} onSaved={handleSaved} />
        </CardContent>
      </Card>
    </div>
  );
}
