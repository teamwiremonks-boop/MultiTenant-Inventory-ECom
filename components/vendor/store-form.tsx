"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { ActionMessage } from "@/components/vendor/action-message";
import { ImageUrlUploader } from "@/components/vendor/image-url-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStore, updateStore } from "@/lib/actions/vendor/stores";
import { storeSchema, type StoreValues } from "@/lib/schemas/vendor";
import { buildStoreMutationPayload } from "@/lib/store-payload.mjs";

type StoreFormProps = {
  mode?: "create" | "update";
  initialValues?: Partial<StoreValues> & { id?: string };
  onSaved?: () => void;
  readOnly?: boolean;
};

export function StoreForm({
  mode = "create",
  initialValues,
  onSaved,
  readOnly = false,
}: StoreFormProps) {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const form = useForm<StoreValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      address: initialValues?.address ?? "",
      imageUrls: initialValues?.imageUrls ?? [],
      is_active: initialValues?.is_active ?? true,
    },
  });

  useEffect(() => {
    form.reset({
      name: initialValues?.name ?? "",
      address: initialValues?.address ?? "",
      imageUrls: initialValues?.imageUrls ?? [],
      is_active: initialValues?.is_active ?? true,
    });
    setMessage(null);
  }, [form, initialValues]);

  async function onSubmit(values: StoreValues) {
    setMessage(null);
    const payload = buildStoreMutationPayload({
      storeId: initialValues?.id,
      values,
    });
    const result =
      mode === "update" ? await updateStore(payload) : await createStore(payload);

    setMessage(
      result.ok
        ? { type: "success", text: "Store saved." }
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
        <Label htmlFor="store-name">Store name</Label>
        <Input
          id="store-name"
          disabled={readOnly}
          {...form.register("name")}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="store-address">Address</Label>
        <Input
          id="store-address"
          disabled={readOnly}
          {...form.register("address")}
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>
      <ImageUrlUploader
        disabled={readOnly}
        folder="stores"
        label="Store images"
        onChange={(urls) => form.setValue("imageUrls", urls, { shouldDirty: true })}
        urls={form.watch("imageUrls")}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          className="size-4"
          disabled={readOnly}
          type="checkbox"
          {...form.register("is_active")}
        />
        Active store
      </label>
      {message && <ActionMessage message={message.text} type={message.type} />}
      <Button disabled={readOnly || form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Saving..." : "Save store"}
      </Button>
    </form>
  );
}
