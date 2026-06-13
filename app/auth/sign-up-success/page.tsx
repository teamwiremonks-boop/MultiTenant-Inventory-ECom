import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { safeNextPath } from "@/lib/redirect-safety.mjs";
import Link from "next/link";
import { Suspense } from "react";

export default function Page({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  return (
    <Suspense>
      <SignUpSuccessContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SignUpSuccessContent({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params?.next, "/");

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Thank you for signing up!
              </CardTitle>
              <CardDescription>Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
              <Button asChild className="mt-4 w-full">
                <Link href={`/auth/login?next=${encodeURIComponent(nextPath)}`}>
                  Continue to login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
