import { z } from "zod";

export const businessSignUpSchema = z
  .object({
    businessName: z.string().min(2, "Business name is required."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    repeatPassword: z.string().min(8, "Confirm your password."),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match.",
    path: ["repeatPassword"],
  });

export const storeSchema = z.object({
  name: z.string().min(2, "Store name is required."),
  address: z.string().min(3, "Address is required."),
  imageUrls: z.array(z.string().url()),
  is_active: z.boolean(),
});

export const brandSchema = z.object({
  name: z.string().min(2, "Brand name is required."),
  description: z.string().optional(),
  logoUrls: z.array(z.string().url()),
  isActive: z.boolean(),
});

const productOptionValueSchema = z.object({
  id: z.string().optional(),
  value: z.string().min(1, "Value is required."),
  sortOrder: z.number().int().min(0).optional(),
});

const productOptionGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Option name is required."),
  sortOrder: z.number().int().min(0).optional(),
  values: z.array(productOptionValueSchema).min(1, "Add at least one value."),
});

const productVariantInventorySchema = z.object({
  storeId: z.string().min(1, "Store is required."),
  quantity: z.number().int().min(0, "Stock cannot be negative."),
});

const productVariantSchema = z.object({
  id: z.string().optional(),
  label: z.string().optional(),
  attributes: z.record(z.string(), z.string()),
  sku: z.string().min(1, "SKU is required."),
  price: z.number().min(0, "Price cannot be negative."),
  imageUrls: z.array(z.string().url()),
  isActive: z.boolean(),
  inventory: z.array(productVariantInventorySchema),
});

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Product name is required."),
  brandId: z.string().min(1, "Brand is required."),
  description: z.string().optional(),
  basePrice: z.number().min(0, "Price cannot be negative."),
  productImages: z.array(z.string().url()),
  optionGroups: z.array(productOptionGroupSchema),
  variants: z.array(productVariantSchema).min(1, "Add at least one variant."),
  isActive: z.boolean(),
});

export const vendorOrderStatusSchema = z.object({
  vendorOrderId: z.string().min(1, "Vendor order ID is required."),
  status: z.enum(["accepted", "rejected", "packed", "shipped", "delivered", "canceled"]),
  reason: z.string().optional(),
});

export const reactivationRequestSchema = z.object({
  reason: z.string().min(20, "Please add a little more context for admin."),
});

export type BusinessSignUpValues = z.infer<typeof businessSignUpSchema>;
export type StoreValues = z.infer<typeof storeSchema>;
export type BrandValues = z.infer<typeof brandSchema>;
export type ProductValues = z.infer<typeof productSchema>;
export type VendorOrderStatusValues = z.infer<typeof vendorOrderStatusSchema>;
export type ReactivationRequestValues = z.infer<
  typeof reactivationRequestSchema
>;
