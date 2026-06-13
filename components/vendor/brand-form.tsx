"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { ActionMessage } from "@/components/vendor/action-message";
import { ImageUrlUploader } from "@/components/vendor/image-url-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveBrand } from "@/lib/actions/vendor/brands";
import { buildBrandMutationPayload } from "@/lib/brand-payload.mjs";
import { brandSchema, type BrandValues } from "@/lib/schemas/vendor";

type BrandFormProps = {
  initialValues?: Partial<BrandValues> & { id?: string };
  onSaved?: () => void;
  readOnly?: boolean;
};

export function BrandForm({
  initialValues,
  onSaved,
  readOnly = false,
}: BrandFormProps) {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const form = useForm<BrandValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      logoUrls: initialValues?.logoUrls ?? [],
      isActive: initialValues?.isActive ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      logoUrls: initialValues?.logoUrls ?? [],
      isActive: initialValues?.isActive ?? true,
    });
    setMessage(null);
  }, [form, initialValues]);

  async function onSubmit(values: BrandValues) {
    setMessage(null);
    const result = await saveBrand(
      buildBrandMutationPayload({
        id: initialValues?.id,
        values,
      }),
    );

    setMessage(
      result.ok
        ? { type: "success", text: "Brand saved." }
        : { type: "error", text: result.error.message },
    );

    if (result.ok) {
      onSaved?.();
    }
  }

  const errors = form.formState.errors;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="brand-name">Brand name</Label>
        <Input id="brand-name" disabled={readOnly} {...form.register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="brand-description">Description</Label>
        <Textarea
          id="brand-description"
          disabled={readOnly}
          {...form.register("description")}
        />
      </div>
      <ImageUrlUploader
        disabled={readOnly}
        folder="brand"
        label="Brand logo"
        onChange={(urls) => form.setValue("logoUrls", urls, { shouldDirty: true })}
        urls={form.watch("logoUrls")}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          className="size-4"
          disabled={readOnly}
          type="checkbox"
          {...form.register("isActive")}
        />
        Active brand
      </label>
      {message && <ActionMessage message={message.text} type={message.type} />}
      <Button disabled={readOnly || form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Saving..." : "Save brand"}
      </Button>
    </form>
  );
}
