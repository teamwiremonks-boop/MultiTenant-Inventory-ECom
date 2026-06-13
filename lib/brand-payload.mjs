export function buildBrandMutationPayload({ id, values }) {
  return {
    ...(id ? { id } : {}),
    name: values.name,
    description: values.description,
    logoUrls: values.logoUrls,
    isActive: values.isActive,
  };
}
