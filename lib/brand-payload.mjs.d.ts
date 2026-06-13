import type { BrandValues } from "@/lib/schemas/vendor";

export function buildBrandMutationPayload(input: {
  id?: string;
  values: BrandValues;
}): {
  id?: string;
  name: string;
  description?: string;
  logoUrls: string[];
  isActive: boolean;
};
