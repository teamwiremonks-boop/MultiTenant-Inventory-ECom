"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";

type ActionMessageProps = {
  type: "success" | "error";
  message: string;
};

export function ActionMessage({ type, message }: ActionMessageProps) {
  return (
    <Alert
      className={
        type === "success"
          ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
          : "border-destructive/40 text-destructive"
      }
    >
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
