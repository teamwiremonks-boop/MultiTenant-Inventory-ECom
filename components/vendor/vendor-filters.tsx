"use client";

import { Filter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VendorFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set(name, value.trim());
    } else {
      params.delete(name);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function clearFilters() {
    startTransition(() => router.replace(pathname));
  }

  return (
    <div className="flex flex-col gap-2 border-t pt-3 lg:flex-row lg:items-center lg:border-t-0 lg:pt-0">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Filter className="size-3.5" />
        Filters
      </div>
      <div className="grid gap-2 sm:grid-cols-3 lg:w-[560px]">
        <Input
          aria-label="Filter by brand"
          className="h-8"
          defaultValue={searchParams.get("brand") ?? ""}
          onBlur={(event) => updateFilter("brand", event.target.value)}
          placeholder="Brand"
        />
        <Input
          aria-label="Filter by product"
          className="h-8"
          defaultValue={searchParams.get("product") ?? ""}
          onBlur={(event) => updateFilter("product", event.target.value)}
          placeholder="Product"
        />
        <Input
          aria-label="Filter by store"
          className="h-8"
          defaultValue={searchParams.get("store") ?? ""}
          onBlur={(event) => updateFilter("store", event.target.value)}
          placeholder="Store"
        />
      </div>
      <Button
        disabled={isPending}
        onClick={clearFilters}
        size="sm"
        type="button"
        variant="ghost"
      >
        Clear
      </Button>
    </div>
  );
}
