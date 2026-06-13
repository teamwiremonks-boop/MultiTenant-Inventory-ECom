"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { getVendorWorkspace } from "@/lib/actions/vendor/workspace";

export function VendorIdentity() {
  const [name, setName] = useState("Vendor");
  const [status, setStatus] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;

    async function loadWorkspace() {
      const result = await getVendorWorkspace();
      if (!mounted || !result.ok) return;

      setName(result.data.vendorName);
      setStatus(result.data.platformStatus);
    }

    loadWorkspace();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-w-0">
      <div className="truncate font-semibold">{name}</div>
      {status && status !== "active" && (
        <Badge className="mt-1" variant="secondary">
          {status}
        </Badge>
      )}
    </div>
  );
}
