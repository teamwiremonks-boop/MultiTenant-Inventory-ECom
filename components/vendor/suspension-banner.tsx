import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type SuspensionBannerProps = {
  suspended?: boolean;
};

export function SuspensionBanner({ suspended = false }: SuspensionBannerProps) {
  if (!suspended) return null;

  return (
    <Alert className="mb-6 border-amber-500/40 bg-amber-500/10">
      <AlertTriangle className="mb-2 size-4" />
      <AlertTitle>Business account is read-only</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Store, brand, product, and inventory changes are paused until admin
          reactivates this vendor account.
        </span>
        <Button asChild size="sm" variant="outline">
          <Link href="/vendor/reactivation">Request reactivation</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
