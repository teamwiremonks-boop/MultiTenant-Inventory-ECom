"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, LogIn, Minus, Plus, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getOrCreateCustomerProfile } from "@/lib/actions/customer/profile";
import { placeOrder } from "@/lib/actions/customer/orders";
import {
  cartItemCount,
  cartSubtotal,
  useCartStore,
} from "@/lib/stores/cart-store";
import { buildCheckoutPayload } from "@/lib/storefront-products";

type CheckoutClientProps = {
  isAuthenticated: boolean;
  email?: string;
};

type CheckoutFormState = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
};

const initialForm: CheckoutFormState = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
};

export function CheckoutClient({ isAuthenticated, email }: CheckoutClientProps) {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{
    orderId?: string;
    orderNumber: string;
  } | null>(null);
  const subtotal = cartSubtotal(items);
  const count = cartItemCount(items);

  const updateField =
    (field: keyof CheckoutFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Add at least one product before checkout.");
      return;
    }

    if (!isAuthenticated) {
      setError("Sign in or create an account to place your order.");
      return;
    }

    setIsSubmitting(true);
    const profile = await getOrCreateCustomerProfile({
      profileStatus: "guest",
      fullName: form.fullName,
      phone: form.phone,
    });

    if (!profile.ok) {
      setError(profile.error.message);
      setIsSubmitting(false);
      return;
    }

    const payload = buildCheckoutPayload({
      items,
      customer: {
        fullName: form.fullName,
        phone: form.phone,
      },
      shippingAddress: {
        recipient: form.fullName,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
      },
    });
    const result = await placeOrder(payload);

    if (!result.ok) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    const data = result.data as { orderId?: string; orderNumber?: string };
    setPlacedOrder({
      orderId: data.orderId,
      orderNumber: data.orderNumber ?? "created",
    });
    clearCart();
    setIsSubmitting(false);
  };

  if (placedOrder) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 data-icon="inline-start" />
              Order placed
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Your order number is{" "}
              <span className="font-medium">{placedOrder.orderNumber}</span>.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {placedOrder.orderId && (
                <Button asChild>
                  <Link href={`/orders/${placedOrder.orderId}`}>Track order</Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href="/">Continue shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 md:grid-cols-[1fr_360px] md:px-6">
        <section className="flex flex-col gap-6">
          <div>
            <Button asChild variant="ghost">
              <Link href="/">Back to products</Link>
            </Button>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal">
              Checkout
            </h1>
            <p className="text-sm text-muted-foreground">
              Cart is open to everyone. Login is requested only when placing the order.
            </p>
          </div>

          {!isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle>Continue to place order</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Sign in or create an account to create your customer profile and finish checkout.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild>
                    <Link href="/auth/login?next=/checkout">
                      <LogIn data-icon="inline-start" />
                      Login
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/auth/sign-up?next=/checkout">
                      <UserPlus data-icon="inline-start" />
                      Create account
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Delivery details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" onSubmit={submitOrder}>
                {email && (
                  <p className="rounded-md bg-muted p-3 text-sm">
                    Checking out as <span className="font-medium">{email}</span>
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="fullName">Recipient name</Label>
                    <Input
                      id="fullName"
                      onChange={updateField("fullName")}
                      required
                      value={form.fullName}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      onChange={updateField("phone")}
                      required
                      value={form.phone}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="line1">Address line 1</Label>
                  <Input
                    id="line1"
                    onChange={updateField("line1")}
                    required
                    value={form.line1}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="line2">Address line 2</Label>
                  <Input
                    id="line2"
                    onChange={updateField("line2")}
                    value={form.line2}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      onChange={updateField("city")}
                      required
                      value={form.city}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      onChange={updateField("state")}
                      required
                      value={form.state}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="postalCode">Postal code</Label>
                    <Input
                      id="postalCode"
                      onChange={updateField("postalCode")}
                      required
                      value={form.postalCode}
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button disabled={!isAuthenticated || isSubmitting || items.length === 0}>
                  {isSubmitting && (
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                  )}
                  Place order
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <aside>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Your cart is empty.
                </p>
              ) : (
                items.map((item) => (
                  <div className="flex gap-3" key={item.variantId}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.variantLabel}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          aria-label={`Decrease ${item.name}`}
                          onClick={() => decrementItem(item.variantId)}
                          size="icon"
                          type="button"
                          variant="outline"
                        >
                          <Minus />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          aria-label={`Increase ${item.name}`}
                          onClick={() => incrementItem(item.variantId)}
                          size="icon"
                          type="button"
                          variant="outline"
                        >
                          <Plus />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))
              )}
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({count})
                </span>
                <span className="font-semibold">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
