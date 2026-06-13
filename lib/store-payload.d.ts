import type { StoreValues } from "@/lib/schemas/vendor";

export function buildStoreMutationPayload(input: {
  storeId?: string;
  values: StoreValues;
}): {
  id?: string;
  name: string;
  address: string;
  imageUrls: string[];
  isActive: boolean;
};
