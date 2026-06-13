import { StorefrontHome } from "@/components/storefront/storefront-home";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPublicProducts } from "@/lib/actions/guest/catalog";
import { createClient } from "@/lib/supabase/server";
import { publicProductToCard } from "@/lib/storefront-products";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <p className="text-sm text-muted-foreground">Loading catalog...</p>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const supabase = await createClient();
  const [{ data: claimsData }, result] = await Promise.all([
    supabase.auth.getClaims(),
    getPublicProducts({ limit: 48 }),
  ]);
  const claims = claimsData?.claims;
  const { data: memberships } = claims
    ? await supabase.from("vendor_members").select("vendor_id").limit(1)
    : { data: [] };

  if (!result.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Alert className="max-w-xl">
          <AlertTitle>Catalog unavailable</AlertTitle>
          <AlertDescription>{result.error.message}</AlertDescription>
        </Alert>
      </main>
    );
  }

  const products = Array.isArray(result.data)
    ? result.data.map((product) =>
        publicProductToCard(product as Record<string, unknown>),
      )
    : [];

  return (
    <StorefrontHome
      isAuthenticated={Boolean(claims)}
      isVendor={Boolean(memberships && memberships.length > 0)}
      products={products}
    />
  );
}
