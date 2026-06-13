import { SignUpForm } from "@/components/sign-up-form";
import { safeNextPath } from "@/lib/redirect-safety.mjs";
import { Suspense } from "react";

export default function Page({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  return (
    <Suspense>
      <SignUpContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SignUpContent({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params?.next, "/protected");

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm nextPath={nextPath} />
      </div>
    </div>
  );
}
