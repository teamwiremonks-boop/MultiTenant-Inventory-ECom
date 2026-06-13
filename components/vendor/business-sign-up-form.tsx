"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  businessSignUpSchema,
  type BusinessSignUpValues,
} from "@/lib/schemas/vendor";

export function BusinessSignUpForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<BusinessSignUpValues>({
    resolver: zodResolver(businessSignUpSchema),
    defaultValues: {
      businessName: "",
      email: "",
      password: "",
      repeatPassword: "",
    },
  });

  async function onSubmit(values: BusinessSignUpValues) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          vendor_name: values.businessName,
          business_name: values.businessName,
          user_type: "vendor",
        },
        emailRedirectTo: `${window.location.origin}/vendor/setup`,
      },
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    router.push("/auth/sign-up-success");
  }

  const errors = form.formState.errors;

  return (
    <Card className="w-full max-w-xl rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Sign up for business</CardTitle>
        <CardDescription>
          Create your vendor account and start setting up your store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input id="businessName" {...form.register("businessName")} />
            {errors.businessName && (
              <p className="text-sm text-destructive">
                {errors.businessName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="owner@example.com"
              {...form.register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="repeatPassword">Confirm password</Label>
              <Input
                id="repeatPassword"
                type="password"
                {...form.register("repeatPassword")}
              />
              {errors.repeatPassword && (
                <p className="text-sm text-destructive">
                  {errors.repeatPassword.message}
                </p>
              )}
            </div>
          </div>
          {formError && (
            <Alert className="border-destructive/40 text-destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <Button
            className="w-full"
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            {form.formState.isSubmitting
              ? "Creating business account..."
              : "Sign up for business"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="font-medium text-foreground underline" href="/auth/login">
              Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
