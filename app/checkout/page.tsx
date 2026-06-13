import { CheckoutClient } from "@/components/storefront/checkout-client";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <p className="text-sm text-muted-foreground">Loading checkout...</p>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

async function CheckoutContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  return (
    <CheckoutClient
      email={typeof claims?.email === "string" ? claims.email : undefined}
      isAuthenticated={Boolean(claims)}
    />
  );
}
