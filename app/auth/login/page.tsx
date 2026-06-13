import { LoginForm } from "@/components/login-form";
import { safeNextPath } from "@/lib/redirect-safety.mjs";
import { Suspense } from "react";

export default function Page({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  return (
    <Suspense>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const hasExplicitNext = typeof params?.next === "string" && params.next.length > 0;
  const nextPath = safeNextPath(params?.next, "/");

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm hasExplicitNext={hasExplicitNext} nextPath={nextPath} />
      </div>
    </div>
  );
}
