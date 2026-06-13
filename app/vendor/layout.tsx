import { VendorShell } from "@/components/vendor/vendor-shell";

export default async function VendorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <VendorShell>{children}</VendorShell>;
}
