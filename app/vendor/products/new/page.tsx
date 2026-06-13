import { ProductForm } from "@/components/vendor/product-form";
import { PageHeader } from "@/components/vendor/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewVendorProductPage() {
  return (
    <div>
      <PageHeader
        description="Create product details, option groups, generated SKUs, images, and store inventory."
        title="New product"
      />
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>
            Product images act as SKU fallbacks. Variant rows can override
            images, price, SKU, and stock by store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
