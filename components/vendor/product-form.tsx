"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bold, Italic, List, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, type Control } from "react-hook-form";

import { ActionMessage } from "@/components/vendor/action-message";
import { ImageUrlUploader } from "@/components/vendor/image-url-uploader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProduct, saveProduct } from "@/lib/actions/vendor/products";
import {
  productSchema,
  type ProductValues,
} from "@/lib/schemas/vendor";
import {
  useVendorCatalog,
  vendorCatalogActions,
} from "@/lib/stores/vendor-catalog";
import {
  buildProductMutationPayload,
  generateVariantMatrix,
} from "@/lib/product-builder.mjs";
import {
  isVendorBrandActive,
  vendorBrandOptionLabel,
  type VendorStore,
} from "@/lib/vendor-data";

type ProductFormProps = {
  initialValues?: ProductValues & { id?: string };
  readOnly?: boolean;
};

type GenerateVariantMatrix = (input: {
  basePrice?: number;
  existingVariants?: ProductValues["variants"];
  optionGroups?: ProductValues["optionGroups"];
  stores?: VendorStore[];
}) => ProductValues["variants"];

type BuildProductMutationPayload = (
  values: ProductValues & { id?: string },
) => unknown;

type OptionValuesEditorProps = {
  control: Control<ProductValues>;
  disabled?: boolean;
  groupIndex: number;
  register: ReturnType<typeof useForm<ProductValues>>["register"];
};

const emptyProductValues: ProductValues = {
  brandId: "",
  name: "",
  description: "",
  basePrice: 0,
  productImages: [],
  optionGroups: [],
  variants: [],
  isActive: true,
};

const createVariantMatrix =
  generateVariantMatrix as unknown as GenerateVariantMatrix;
const createProductPayload =
  buildProductMutationPayload as unknown as BuildProductMutationPayload;

export function ProductForm({
  initialValues,
  readOnly = false,
}: ProductFormProps) {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const brands = useVendorCatalog((state) => state.brands);
  const catalogLoaded = useVendorCatalog((state) => state.loaded);
  const stores = useVendorCatalog((state) => state.stores);
  const vendorId = useVendorCatalog((state) => state.workspace?.vendorId);
  const router = useRouter();

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues ?? emptyProductValues,
  });
  const optionGroupsField = useFieldArray({
    control: form.control,
    name: "optionGroups",
  });

  const optionGroups = form.watch("optionGroups");
  const basePrice = form.watch("basePrice");
  const variants = form.watch("variants");
  const productImages = form.watch("productImages");

  useEffect(() => {
    form.reset(initialValues ?? emptyProductValues);
    setMessage(null);
  }, [form, initialValues]);

  useEffect(() => {
    void vendorCatalogActions.loadCatalog();
  }, []);

  useEffect(() => {
    if (!catalogLoaded) return;

    const nextVariants = createVariantMatrix({
      basePrice,
      existingVariants: form.getValues("variants"),
      optionGroups,
      stores,
    });

    form.setValue("variants", nextVariants, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [basePrice, catalogLoaded, form, optionGroups, stores]);

  function addOptionGroup() {
    optionGroupsField.append({
      name: "",
      values: [{ value: "" }],
    });
  }

  function refreshVariantMatrix() {
    form.setValue(
      "variants",
      createVariantMatrix({
        basePrice,
        existingVariants: form.getValues("variants"),
        optionGroups,
        stores,
      }),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  async function onSubmit() {
    setMessage(null);
    const result = await saveProduct(
      createProductPayload({
        ...form.getValues(),
        id: initialValues?.id,
      }),
    );

    setMessage(
      result.ok
        ? { type: "success", text: "Product saved." }
        : { type: "error", text: result.error.message },
    );
  }

  async function handleDeleteProduct() {
    if (!initialValues?.id) return;

    if (
      !window.confirm(
        `Delete ${initialValues.name || "this product"}? This will remove it from the active product catalog.`,
      )
    ) {
      return;
    }

    setMessage(null);
    const result = await deleteProduct({ productId: initialValues.id });

    if (result.ok) {
      router.push("/vendor/products");
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error.message });
    }
  }

  const errors = form.formState.errors;

  return (
    <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
      <section className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div className="space-y-2">
            <Label htmlFor="product-name">Name</Label>
            <Input
              id="product-name"
              disabled={readOnly}
              {...form.register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-brand">Brand</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
              id="product-brand"
              disabled={readOnly}
              {...form.register("brandId")}
            >
              <option value="">Select a brand</option>
              {brands.map((brand) => (
                <option
                  disabled={!isVendorBrandActive(brand)}
                  key={brand.id}
                  value={brand.id}
                >
                  {vendorBrandOptionLabel(brand)}
                </option>
              ))}
            </select>
            {errors.brandId && (
              <p className="text-sm text-destructive">
                {errors.brandId.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            <Label htmlFor="product-base-price">Base price</Label>
            <Input
              id="product-base-price"
              disabled={readOnly}
              min="0"
              step="0.01"
              type="number"
              {...form.register("basePrice", { valueAsNumber: true })}
            />
            {errors.basePrice && (
              <p className="text-sm text-destructive">
                {errors.basePrice.message}
              </p>
            )}
          </div>
          <RichTextEditor
            disabled={readOnly}
            label="Description"
            onChange={(description) =>
              form.setValue("description", description, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            value={form.watch("description") ?? ""}
          />
        </div>

        <ImageUrlUploader
          disabled={readOnly}
          folder="products"
          label="Product images"
          onChange={(urls) =>
            form.setValue("productImages", urls, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          urls={productImages}
          vendorId={vendorId}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Options</h2>
            <p className="text-sm text-muted-foreground">
              Add option groups like Size or Color, then list each value.
            </p>
          </div>
          <Button
            disabled={readOnly}
            onClick={addOptionGroup}
            type="button"
            variant="outline"
          >
            <Plus className="size-4" />
            Add option
          </Button>
        </div>

        <div className="space-y-3">
          {optionGroupsField.fields.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No options yet. A default SKU row will be generated.
            </div>
          ) : (
            optionGroupsField.fields.map((field, groupIndex) => (
              <div className="rounded-lg border p-4" key={field.id}>
                <div className="grid gap-3 lg:grid-cols-[240px_1fr_auto]">
                  <div className="space-y-2">
                    <Label>Option name</Label>
                    <Input
                      disabled={readOnly}
                      placeholder="Size"
                      {...form.register(`optionGroups.${groupIndex}.name`)}
                    />
                  </div>
                  <OptionValuesEditor
                    control={form.control}
                    disabled={readOnly}
                    groupIndex={groupIndex}
                    register={form.register}
                  />
                  <Button
                    className="self-end"
                    disabled={readOnly}
                    onClick={() => optionGroupsField.remove(groupIndex)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Variants</h2>
            <p className="text-sm text-muted-foreground">
              Each option combination becomes a SKU with inline store inventory.
            </p>
          </div>
          <Button
            disabled={readOnly}
            onClick={refreshVariantMatrix}
            type="button"
            variant="outline"
          >
            <RefreshCw className="size-4" />
            Regenerate
          </Button>
        </div>

        <VariantTable
          disabled={readOnly}
          form={form}
          productImages={productImages}
          stores={stores}
          variants={variants}
          vendorId={vendorId}
        />
        {errors.variants && (
          <p className="text-sm text-destructive">{errors.variants.message}</p>
        )}
      </section>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={form.watch("isActive")}
          disabled={readOnly}
          onCheckedChange={(checked) =>
            form.setValue("isActive", checked === true, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        Active product
      </label>

      {message && <ActionMessage message={message.text} type={message.type} />}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button disabled={readOnly || form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? "Saving..." : "Save product"}
        </Button>
        {initialValues?.id && (
          <Button
            disabled={readOnly || form.formState.isSubmitting}
            onClick={handleDeleteProduct}
            type="button"
            variant="destructive"
          >
            <Trash2 className="size-4" />
            Delete product
          </Button>
        )}
      </div>
    </form>
  );
}

function OptionValuesEditor({
  control,
  disabled,
  groupIndex,
  register,
}: OptionValuesEditorProps) {
  const valueFields = useFieldArray({
    control,
    name: `optionGroups.${groupIndex}.values`,
  });

  return (
    <div className="space-y-2">
      <Label>Values</Label>
      <div className="flex flex-wrap gap-2">
        {valueFields.fields.map((field, valueIndex) => (
          <div className="flex items-center gap-1" key={field.id}>
            <Input
              className="h-8 w-24"
              disabled={disabled}
              placeholder="S"
              {...register(
                `optionGroups.${groupIndex}.values.${valueIndex}.value`,
              )}
            />
            <Button
              disabled={disabled}
              onClick={() => valueFields.remove(valueIndex)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
        <Button
          disabled={disabled}
          onClick={() => valueFields.append({ value: "" })}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="size-4" />
          Value
        </Button>
      </div>
    </div>
  );
}

function RichTextEditor({
  disabled,
  label,
  onChange,
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  function runCommand(command: string) {
    if (disabled) return;
    document.execCommand(command);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="rounded-md border">
        <div className="flex items-center gap-1 border-b p-1">
          <Button
            disabled={disabled}
            onClick={() => runCommand("bold")}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Bold className="size-4" />
          </Button>
          <Button
            disabled={disabled}
            onClick={() => runCommand("italic")}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Italic className="size-4" />
          </Button>
          <Button
            disabled={disabled}
            onClick={() => runCommand("insertUnorderedList")}
            size="icon"
            type="button"
            variant="ghost"
          >
            <List className="size-4" />
          </Button>
        </div>
        <div
          aria-label={label}
          className="min-h-28 px-3 py-2 text-sm outline-hidden prose-p:m-0"
          contentEditable={!disabled}
          onInput={(event) => onChange(event.currentTarget.innerHTML)}
          ref={editorRef}
          role="textbox"
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}

function VariantTable({
  disabled,
  form,
  productImages,
  stores,
  variants,
  vendorId,
}: {
  disabled?: boolean;
  form: ReturnType<typeof useForm<ProductValues>>;
  productImages: string[];
  stores: VendorStore[];
  variants: ProductValues["variants"];
  vendorId?: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-40">Variant</TableHead>
          <TableHead className="min-w-36">SKU</TableHead>
          {stores.map((store) => (
            <TableHead className="min-w-28" key={store.id}>
              <span>{store.name}</span>
              {store.is_active === false && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  inactive
                </span>
              )}
            </TableHead>
          ))}
          <TableHead className="min-w-28">Price</TableHead>
          <TableHead className="min-w-64">Images</TableHead>
          <TableHead className="min-w-20">Active</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variants.map((variant, variantIndex) => (
          <TableRow key={`${variant.label}-${variantIndex}`}>
            <TableCell>
              <div className="font-medium">{variant.label ?? "Default"}</div>
              <div className="text-xs text-muted-foreground">
                {Object.entries(variant.attributes)
                  .map(([name, value]) => `${name}: ${value}`)
                  .join(" | ") || "Default SKU"}
              </div>
            </TableCell>
            <TableCell>
              <Input
                disabled={disabled}
                {...form.register(`variants.${variantIndex}.sku`)}
              />
            </TableCell>
            {stores.map((store, storeIndex) => (
              <TableCell key={store.id}>
                <Input
                  disabled={disabled || store.is_active === false}
                  min="0"
                  onChange={(event) => {
                    form.setValue(
                      `variants.${variantIndex}.inventory.${storeIndex}`,
                      {
                        storeId: store.id,
                        quantity:
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value),
                      },
                      { shouldDirty: true, shouldValidate: true },
                    );
                  }}
                  type="number"
                  value={variant.inventory?.[storeIndex]?.quantity ?? 0}
                />
                <input
                  type="hidden"
                  defaultValue={store.id}
                  {...form.register(
                    `variants.${variantIndex}.inventory.${storeIndex}.storeId`,
                  )}
                />
              </TableCell>
            ))}
            <TableCell>
              <Input
                disabled={disabled}
                min="0"
                step="0.01"
                type="number"
                {...form.register(`variants.${variantIndex}.price`, {
                  valueAsNumber: true,
                })}
              />
            </TableCell>
            <TableCell>
              <ImageUrlUploader
                compact
                disabled={disabled}
                folder="products"
                label="SKU images"
                onChange={(urls) =>
                  form.setValue(`variants.${variantIndex}.imageUrls`, urls, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                urls={variant.imageUrls}
                vendorId={vendorId}
              />
              {variant.imageUrls.length === 0 && productImages.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Uses product images
                </p>
              )}
            </TableCell>
            <TableCell>
              <Checkbox
                checked={variant.isActive}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  form.setValue(
                    `variants.${variantIndex}.isActive`,
                    checked === true,
                    { shouldDirty: true, shouldValidate: true },
                  )
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
