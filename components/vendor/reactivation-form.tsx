"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ActionMessage } from "@/components/vendor/action-message";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requestVendorReactivation } from "@/lib/actions/vendor/activation";
import {
  reactivationRequestSchema,
  type ReactivationRequestValues,
} from "@/lib/schemas/vendor";

export function ReactivationForm() {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const form = useForm<ReactivationRequestValues>({
    resolver: zodResolver(reactivationRequestSchema),
    defaultValues: { reason: "" },
  });

  async function onSubmit(values: ReactivationRequestValues) {
    setMessage(null);
    const result = await requestVendorReactivation(values);
    setMessage(
      result.ok
        ? { type: "success", text: "Reactivation request sent." }
        : { type: "error", text: result.error.message },
    );
  }

  const error = form.formState.errors.reason;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="reactivation-reason">Reason</Label>
        <Textarea
          id="reactivation-reason"
          placeholder="Explain what changed and why your business should be reactivated."
          {...form.register("reason")}
        />
        {error && <p className="text-sm text-destructive">{error.message}</p>}
      </div>
      {message && <ActionMessage message={message.text} type={message.type} />}
      <Button disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Sending..." : "Request reactivation"}
      </Button>
    </form>
  );
}
