export function buildStoreMutationPayload({ storeId, values }) {
  return {
    ...(storeId ? { id: storeId } : {}),
    name: values.name,
    address: values.address,
    imageUrls: values.imageUrls,
    isActive: values.is_active,
  };
}
