import { BusinessSignUpForm } from "@/components/vendor/business-sign-up-form";

export default function BusinessSignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1fr] lg:items-center">
        <section className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Vendor onboarding
          </p>
          <h1 className="text-4xl font-semibold tracking-normal">
            Sign up for business
          </h1>
          <p className="text-base text-muted-foreground">
            Create your vendor account, set up a store and brand, then manage
            orders from one operations-first workspace.
          </p>
        </section>
        <BusinessSignUpForm />
      </div>
    </main>
  );
}
