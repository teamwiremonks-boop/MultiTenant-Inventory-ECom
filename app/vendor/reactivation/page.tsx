import { ReactivationForm } from "@/components/vendor/reactivation-form";
import { PageHeader } from "@/components/vendor/page-header";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VendorReactivationPage() {
  return (
    <div>
      <PageHeader
        badge="Suspended vendor path"
        description="A suspended vendor keeps read access and can ask admin to restore write access."
        title="Reactivation"
      />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Alert className="border-amber-500/40 bg-amber-500/10">
          <AlertTitle>Read-only mode</AlertTitle>
          <AlertDescription>
            When a vendor is suspended, product, brand, store, inventory, and
            fulfillment mutations should be disabled in the UI and rejected by
            Supabase RPCs.
          </AlertDescription>
        </Alert>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Request admin review</CardTitle>
            <CardDescription>
              This sends a reactivation request through the vendor activation
              workflow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReactivationForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
