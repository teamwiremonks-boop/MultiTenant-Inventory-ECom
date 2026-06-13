import Link from "next/link";
import { Suspense } from "react";

import { LogoutButton } from "@/components/logout-button";
import { VendorMobileNav, VendorSidebarNav } from "@/components/vendor/vendor-nav";
import { VendorFilters } from "@/components/vendor/vendor-filters";
import { VendorIdentity } from "@/components/vendor/vendor-identity";

type VendorShellProps = {
  children: React.ReactNode;
};

export function VendorShell({ children }: VendorShellProps) {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <div className="flex min-h-screen">
        <Suspense fallback={null}>
          <VendorSidebarNav />
        </Suspense>
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center justify-between gap-4">
              <Link className="font-semibold md:hidden" href="/vendor/dashboard">
                <VendorIdentity />
              </Link>
              <div className="hidden text-sm text-muted-foreground md:block">
                Vendor workspace
              </div>
                <div className="flex items-center gap-2">
                  <LogoutButton />
                </div>
              </div>
              <Suspense fallback={null}>
                <VendorFilters />
              </Suspense>
            </div>
            <Suspense fallback={null}>
              <VendorMobileNav />
            </Suspense>
          </header>
          <div className="px-4 py-6 md:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
