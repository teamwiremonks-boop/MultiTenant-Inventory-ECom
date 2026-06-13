import type { ProductValues } from "@/lib/schemas/vendor";
import type { VendorStore } from "@/lib/vendor-data";

export function generateVariantMatrix(input: {
  basePrice?: number;
  existingVariants?: ProductValues["variants"];
  optionGroups?: ProductValues["optionGroups"];
  stores?: Pick<VendorStore, "id" | "name">[];
}): ProductValues["variants"];

export function productResponseToFormValues(
  productResponse: Record<string, unknown>,
): ProductValues & { id?: string };

export function buildProductMutationPayload(
  values: ProductValues & { id?: string },
): {
  product: {
    id?: string;
    brandId: string;
    name: string;
    description: string;
    basePrice: number;
    isActive: boolean;
    productImages: string[];
    optionGroups: ProductValues["optionGroups"];
    variants: ProductValues["variants"];
  };
};
