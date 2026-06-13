"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ActionMessage } from "@/components/vendor/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateVendorOrderStatus } from "@/lib/actions/vendor/orders";
import {
  vendorOrderStatusSchema,
  type VendorOrderStatusValues,
} from "@/lib/schemas/vendor";

type OrderStatusFormProps = {
  vendorOrderId?: string;
  currentStatus?: string;
  readOnly?: boolean;
  onUpdated?: (status: string) => void;
};

export function OrderStatusForm({
  currentStatus = "placed",
  vendorOrderId = "",
  readOnly = false,
  onUpdated,
}: OrderStatusFormProps) {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const form = useForm<VendorOrderStatusValues>({
    resolver: zodResolver(vendorOrderStatusSchema),
    defaultValues: {
      vendorOrderId,
      status: nextVendorStatuses(currentStatus)[0] ?? "accepted",
      reason: "",
    },
  });

  async function onSubmit(values: VendorOrderStatusValues) {
    setMessage(null);
    const result = await updateVendorOrderStatus({
      vendorOrderId: values.vendorOrderId,
      status: values.status,
      note: values.reason,
    });
    if (result.ok) {
      onUpdated?.(values.status);
    }
    setMessage(
      result.ok
        ? { type: "success", text: "Order status updated." }
        : { type: "error", text: result.error.message },
    );
  }

  const errors = form.formState.errors;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vendor-order-id">Vendor order ID</Label>
          <Input
            id="vendor-order-id"
            disabled={readOnly}
            {...form.register("vendorOrderId")}
          />
          {errors.vendorOrderId && (
            <p className="text-sm text-destructive">{errors.vendorOrderId.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-status">Status</Label>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm"
            disabled={readOnly}
            id="order-status"
            {...form.register("status")}
          >
            {nextVendorStatuses(currentStatus).map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status-reason">Note</Label>
        <Textarea
          id="status-reason"
          disabled={readOnly}
          {...form.register("reason")}
        />
      </div>
      {message && <ActionMessage message={message.text} type={message.type} />}
      <Button disabled={readOnly || form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Updating..." : "Update status"}
      </Button>
    </form>
  );
}

function nextVendorStatuses(status: string) {
  switch (status) {
    case "placed":
      return ["accepted", "rejected", "canceled"] as const;
    case "accepted":
      return ["packed"] as const;
    case "packed":
      return ["shipped"] as const;
    case "shipped":
      return ["delivered"] as const;
    default:
      return [] as const;
  }
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
