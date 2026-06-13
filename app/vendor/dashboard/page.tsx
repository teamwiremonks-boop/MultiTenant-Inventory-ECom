import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  ClipboardList,
  Package,
  Boxes,
  Store,
  Truck,
} from "lucide-react";

import { PageHeader } from "@/components/vendor/page-header";
import { SuspensionBanner } from "@/components/vendor/suspension-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBrands } from "@/lib/actions/vendor/brands";
import { listVendorOrders } from "@/lib/actions/vendor/orders";
import { getProducts } from "@/lib/actions/vendor/products";
import { getVendorStores } from "@/lib/actions/vendor/stores";
import { getVendorWorkspace } from "@/lib/actions/vendor/workspace";
import {
  summarizeVendorDashboard,
  summarizeVendorOrders,
} from "@/lib/vendor-dashboard-summary.mjs";
import {
  asArray,
  type VendorBrand,
  type VendorProduct,
  type VendorStore,
} from "@/lib/vendor-data";

const summarizeDashboard = summarizeVendorDashboard as (input: {
  brands: VendorBrand[];
  products: VendorProduct[];
  stores: VendorStore[];
}) => {
  brands: { active: number; inactive: number; total: number };
  products: {
    active: number;
    inactive: number;
    suspended: number;
    total: number;
  };
  stores: { active: number; inactive: number; total: number };
};

const summarizeOrders = summarizeVendorOrders as (orders: Array<{ status?: string }>) => {
  total: number;
  open: number;
  byStatus: Record<string, number>;
};

export default function VendorDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <VendorDashboardContent />
    </Suspense>
  );
}

async function VendorDashboardContent() {
  const [workspaceResult, productResult, brandResult, storeResult, orderResult] =
    await Promise.all([
      getVendorWorkspace(),
      getProducts(),
      getBrands(),
      getVendorStores(),
      listVendorOrders(),
    ]);

  const isSuspended = workspaceResult.ok
    ? workspaceResult.data.isSuspended
    : false;
  const products = productResult.ok
    ? asArray<VendorProduct>(productResult.data)
    : [];
  const brands = brandResult.ok ? asArray<VendorBrand>(brandResult.data) : [];
  const stores = storeResult.ok ? storeResult.data : [];
  const orders = orderResult.ok ? orderResult.data : [];
  const summary = summarizeDashboard({ brands, products, stores });
  const orderSummary = summarizeOrders(orders);

  const stats = [
    {
      detail: `${summary.products.active} active, ${summary.products.inactive} inactive`,
      href: "/vendor/products",
      icon: Package,
      label: "Products",
      value: summary.products.total,
    },
    {
      detail: `${summary.brands.active} active, ${summary.brands.inactive} inactive`,
      href: "/vendor/brands",
      icon: Boxes,
      label: "Brands",
      value: summary.brands.total,
    },
    {
      detail: `${summary.stores.active} active, ${summary.stores.inactive} inactive`,
      href: "/vendor/stores",
      icon: Store,
      label: "Stores",
      value: summary.stores.total,
    },
    {
      detail: `${orderSummary.open} open, ${orderSummary.byStatus.delivered ?? 0} delivered`,
      href: "/vendor/orders",
      icon: ClipboardList,
      label: "Orders",
      value: orderSummary.total,
    },
  ];

  return (
    <div>
      <SuspensionBanner suspended={isSuspended} />
      <PageHeader
        badge="Operations first"
        description="Track fulfillment work first, then keep catalog setup and stock health close by."
        title="Dashboard"
      >
        <Button asChild disabled={isSuspended}>
          <Link href="/vendor/orders">
            Open orders
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card className="rounded-lg" key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <item.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.detail}
              </p>
              <Button asChild className="mt-3 h-8 px-2 text-xs" variant="ghost">
                <Link href={item.href}>View</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Catalog health</CardTitle>
            <CardDescription>
              Inactive records stay visible for management but are hidden from
              public selling flows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Inactive</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Products</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{summary.products.active}</Badge>
                  </TableCell>
                  <TableCell>{summary.products.inactive}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/vendor/products">Review</Link>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Brands</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{summary.brands.active}</Badge>
                  </TableCell>
                  <TableCell>{summary.brands.inactive}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/vendor/brands">Review</Link>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Stores</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{summary.stores.active}</Badge>
                  </TableCell>
                  <TableCell>{summary.stores.inactive}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/vendor/stores">Review</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Next actions</CardTitle>
            <CardDescription>
              Keep setup and catalog health moving without distracting from
              fulfillment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/vendor/products/new">
                <Package className="size-4" />
                Add product
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/vendor/stores">
                <Store className="size-4" />
                Manage stores
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/vendor/orders">
                <Truck className="size-4" />
                View orders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Loading vendor workspace summary."
        title="Dashboard"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Card className="h-32 rounded-lg" key={item} />
        ))}
      </div>
    </div>
  );
}
