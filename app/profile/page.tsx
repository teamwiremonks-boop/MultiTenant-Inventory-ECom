import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateCustomerProfile } from "@/lib/actions/customer/profile";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </main>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const result = await getOrCreateCustomerProfile({ profileStatus: "guest" });
  const profile = result.ok ? (result.data as Record<string, unknown>) : null;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
        <Button asChild className="w-fit" variant="ghost">
          <Link href="/">Back to shop</Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {!result.ok ? (
              <p className="text-destructive">{result.error.message}</p>
            ) : (
              <>
                <p>Email: {String(profile?.email ?? "")}</p>
                <p>Status: {String(profile?.profileStatus ?? "guest")}</p>
                <p>Name: {String(profile?.fullName ?? "Not added yet")}</p>
                <p>Phone: {String(profile?.phone ?? "Not added yet")}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
