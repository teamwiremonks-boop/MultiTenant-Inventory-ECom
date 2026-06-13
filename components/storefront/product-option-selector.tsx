"use client";

import { Button } from "@/components/ui/button";
import {
  isOptionValueAvailable,
  type StorefrontProductVariant,
  variantOptionGroups,
} from "@/lib/storefront-products";

type ProductOptionSelectorProps = {
  onChange: (name: string, value: string) => void;
  selectedOptions: Record<string, string>;
  variants: StorefrontProductVariant[];
};

type ProductOptionGroup = {
  name: string;
  values: Array<{ available: boolean; value: string }>;
};

export function ProductOptionSelector({
  onChange,
  selectedOptions,
  variants,
}: ProductOptionSelectorProps) {
  const groups = variantOptionGroups(variants) as ProductOptionGroup[];

  if (groups.length === 0) return null;

  return (
    <div className="grid w-full gap-3">
      {groups.map((group) => (
        <fieldset className="grid gap-2" key={group.name}>
          <legend className="text-xs font-medium text-muted-foreground">
            {group.name}
          </legend>
          <div className="flex flex-wrap gap-2">
            {group.values.map((option) => {
              const selected = selectedOptions[group.name] === option.value;
              const available = isOptionValueAvailable(
                variants,
                selectedOptions,
                group.name,
                option.value,
              );

              return (
                <Button
                  aria-pressed={selected}
                  className="h-8 px-3 text-xs"
                  disabled={!available}
                  key={option.value}
                  onClick={() => onChange(group.name, option.value)}
                  type="button"
                  variant={selected ? "default" : "outline"}
                >
                  {option.value}
                </Button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
