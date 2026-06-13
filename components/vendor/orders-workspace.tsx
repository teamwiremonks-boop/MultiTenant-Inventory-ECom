"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronDown, Loader2, PackageCheck, X } from "lucide-react";

import { ActionMessage } from "@/components/vendor/action-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  getVendorOrder,
  getVendorOrderInventory,
  updateVendorOrderStatus,
} from "@/lib/actions/vendor/orders";
import {
  buildFulfillmentPayload,
  formatVariantAttributes,
  initialFulfillmentDraft,
  summarizeVendorOrderRow,
  validateFulfillmentDraft,
  type FulfillmentDraft,
  type FulfillmentInventoryRow,
  type VendorOrderDetail,
  type VendorOrderItem,
} from "@/lib/vendor-order-fulfillment";

type VendorOrdersWorkspaceProps = {
  initialOrders: Array<Record<string, unknown>>;
};

type ActionMessageState = {
  text: string;
  type: "error" | "success";
} | null;

export function VendorOrdersWorkspace({
  initialOrders,
}: VendorOrdersWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedOrderId = searchParams.get("orderId") ?? "";
  const [detail, setDetail] = useState<VendorOrderDetail | null>(null);
  const [draft, setDraft] = useState<FulfillmentDraft>({});
  const [inventory, setInventory] = useState<FulfillmentInventoryRow[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [message, setMessage] = useState<ActionMessageState>(null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      if (!selectedOrderId) {
        setDetail(null);
        setInventory([]);
        setDraft({});
        setMessage(null);
        return;
      }

      setIsLoadingDetail(true);
      setMessage(null);

      const [orderResult, inventoryResult] = await Promise.all([
        getVendorOrder({ vendorOrderId: selectedOrderId }),
        getVendorOrderInventory({ vendorOrderId: selectedOrderId }),
      ]);

      if (!mounted) return;

      if (!orderResult.ok) {
        setMessage({ text: orderResult.error.message, type: "error" });
        setDetail(null);
        setInventory([]);
        setDraft({});
        setIsLoadingDetail(false);
        return;
      }

      const nextDetail = orderResult.data.detail as VendorOrderDetail | null;
      setDetail(nextDetail);
      setDraft(initialFulfillmentDraft(nextDetail?.vendorOrder.items ?? []));

      if (inventoryResult.ok) {
        setInventory(inventoryResult.data as FulfillmentInventoryRow[]);
      } else {
        setInventory([]);
        setMessage({ text: inventoryResult.error.message, type: "error" });
      }

      setIsLoadingDetail(false);
    }

    void loadDetail();

    return () => {
      mounted = false;
    };
  }, [selectedOrderId]);

  function openOrder(orderId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("orderId", orderId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function closeOrder() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("orderId");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  async function updateStatus(status: string, payload?: Record<string, unknown>) {
    if (!detail?.vendorOrder.id) return;

    setMessage(null);

    const result = await updateVendorOrderStatus({
      vendorOrderId: detail.vendorOrder.id,
      status,
      note,
      ...payload,
    });

    if (result.ok) {
      setMessage({ text: "Order updated.", type: "success" });
      startTransition(() => router.refresh());
      const refreshed = await getVendorOrder({ vendorOrderId: detail.vendorOrder.id });
      if (refreshed.ok) {
        const nextDetail = refreshed.data.detail as VendorOrderDetail | null;
        setDetail(nextDetail);
        setDraft(initialFulfillmentDraft(nextDetail?.vendorOrder.items ?? []));
      }
      return;
    }

    setMessage({ text: result.error.message, type: "error" });
  }

  function acceptOrder() {
    if (!detail) return;

    const validation = validateFulfillmentDraft({
      draft,
      inventory,
      items: detail.vendorOrder.items,
    });

    if (!validation.valid) {
      setMessage({
        text: Object.values(validation.errors).flat()[0] ?? "Review fulfillment.",
        type: "error",
      });
      return;
    }

    void updateStatus(
      "accepted",
      buildFulfillmentPayload(detail.vendorOrder.id, draft),
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialOrders.length === 0 ? (
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={5}>
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                initialOrders.map((order) => (
                  <OrderQueueRow
                    isSelected={selectedOrderId === order.id}
                    key={String(order.id)}
                    onOpen={openOrder}
                    order={order}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedOrderId && (
        <OrderDrawer
          closeOrder={closeOrder}
          detail={detail}
          draft={draft}
          inventory={inventory}
          isLoading={isLoadingDetail || isPending}
          message={message}
          note={note}
          onAccept={acceptOrder}
          onDraftChange={setDraft}
          onNoteChange={setNote}
          onStatusUpdate={updateStatus}
        />
      )}
    </div>
  );
}

function OrderQueueRow({
  isSelected,
  onOpen,
  order,
}: {
  isSelected: boolean;
  onOpen: (orderId: string) => void;
  order: Record<string, unknown>;
}) {
  const summary = summarizeVendorOrderRow(order);
  const orderId = String(order.id ?? "");

  return (
    <TableRow
      className={`cursor-pointer ${isSelected ? "bg-muted/60" : ""}`}
      onClick={() => onOpen(orderId)}
    >
      <TableCell>
        <div className="font-medium">{String(order.orderNumber ?? order.order_id ?? orderId)}</div>
        <div className="text-xs text-muted-foreground">{shortId(orderId)}</div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{summary.itemCount} SKU{summary.itemCount === 1 ? "" : "s"}</div>
        <div className="text-xs text-muted-foreground">
          {summary.orderedQuantity} unit{summary.orderedQuantity === 1 ? "" : "s"}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={summary.state === "ready" ? "secondary" : "outline-solid"}>
          {summary.fulfillmentLabel}
        </Badge>
        <div className="mt-1 text-xs text-muted-foreground">
          {summary.allocatedQuantity}/{summary.orderedQuantity} allocated
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{String(order.status ?? "placed")}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(order.updated_at ?? order.updatedAt ?? order.created_at)}
      </TableCell>
    </TableRow>
  );
}

function OrderDrawer({
  closeOrder,
  detail,
  draft,
  inventory,
  isLoading,
  message,
  note,
  onAccept,
  onDraftChange,
  onNoteChange,
  onStatusUpdate,
}: {
  closeOrder: () => void;
  detail: VendorOrderDetail | null;
  draft: FulfillmentDraft;
  inventory: FulfillmentInventoryRow[];
  isLoading: boolean;
  message: ActionMessageState;
  note: string;
  onAccept: () => void;
  onDraftChange: (draft: FulfillmentDraft) => void;
  onNoteChange: (note: string) => void;
  onStatusUpdate: (status: string) => Promise<void>;
}) {
  const status = detail?.vendorOrder.status ?? "placed";
  const validation = useMemo<{ errors: Record<string, string[]>; valid: boolean }>(
    () =>
      detail
        ? validateFulfillmentDraft({
            draft,
            inventory,
            items: detail.vendorOrder.items,
          })
        : { errors: {} as Record<string, string[]>, valid: false },
    [detail, draft, inventory],
  );
  const canAccept = status === "placed" && validation.valid;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close order drawer"
        className="absolute inset-0 bg-background/70"
        onClick={closeOrder}
        type="button"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full flex-col border-l bg-background shadow-xl sm:max-w-xl lg:max-w-2xl">
        <header className="flex items-start justify-between gap-4 border-b p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold">
                {detail?.order.orderNumber ?? "Order"}
              </h2>
              <Badge variant="secondary">{status}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {detail ? `${detail.vendorOrder.items.length} SKU${detail.vendorOrder.items.length === 1 ? "" : "s"} in this vendor branch` : "Loading order"}
            </p>
          </div>
          <Button onClick={closeOrder} size="icon" type="button" variant="ghost">
            <X />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading order
            </div>
          )}

          {!isLoading && detail && (
            <div className="space-y-3">
              <CollapsibleSection defaultOpen title="Order details">
                <OrderSummary detail={detail} />
              </CollapsibleSection>

              <CollapsibleSection defaultOpen title="Fulfillment details">
                <FulfillmentEditor
                  draft={draft}
                  errors={validation.errors}
                  inventory={inventory}
                  items={detail.vendorOrder.items}
                  onDraftChange={onDraftChange}
                  readOnly={status !== "placed"}
                />
              </CollapsibleSection>

              <CollapsibleSection title="Status note">
                <div className="space-y-2">
                  <Label htmlFor="vendor-order-note">Note</Label>
                  <Textarea
                    id="vendor-order-note"
                    onChange={(event) => onNoteChange(event.target.value)}
                    placeholder="Optional note for this status update"
                    value={note}
                  />
                </div>
              </CollapsibleSection>
            </div>
          )}
        </div>

        <footer className="border-t bg-background p-4">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <PackageCheck className="size-4 text-muted-foreground" />
            {status === "placed" ? (
              <span className={validation.valid ? "text-muted-foreground" : "text-destructive"}>
                {validation.valid ? "All SKUs are fully allocated." : "Review allocation before accepting."}
              </span>
            ) : (
              <span className="text-muted-foreground">Fulfillment allocation is locked.</span>
            )}
          </div>
          {message && <ActionMessage message={message.text} type={message.type} />}
          <div className="mt-3 flex flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              {status === "placed" && (
                <>
                  <Button
                    disabled={isLoading}
                    onClick={() => void onStatusUpdate("rejected")}
                    type="button"
                    variant="outline"
                  >
                    Reject
                  </Button>
                  <Button
                    disabled={isLoading}
                    onClick={() => void onStatusUpdate("canceled")}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
            <StatusPrimaryAction
              canAccept={canAccept}
              isLoading={isLoading}
              onAccept={onAccept}
              onStatusUpdate={onStatusUpdate}
              status={status}
            />
          </div>
        </footer>
      </aside>
    </div>
  );
}

function OrderSummary({ detail }: { detail: VendorOrderDetail }) {
  const address = detail.order.shippingAddress as
    | Record<string, unknown>
    | null
    | undefined;
  const addressLine = formatAddress(address);
  const addressPhone =
    typeof address?.phone === "string" && address.phone.trim()
      ? address.phone
      : "";

  return (
    <section className="grid gap-3 text-sm">
      <DetailRow label="Created" value={formatDate(detail.order.createdAt)} />
      <DetailRow label="Updated" value={formatDate(detail.order.updatedAt)} />
      <DetailRow label="Delivery address" value={addressLine} />
      <DetailRow
        label="Recipient"
        value={typeof address?.recipient === "string" ? address.recipient : "-"}
      />
      <DetailRow label="Email" value={detail.order.customerEmail || "-"} />
      <DetailRow
        label="Phone"
        value={detail.order.customerPhone || addressPhone || "-"}
      />
    </section>
  );
}

function CollapsibleSection({
  children,
  defaultOpen = false,
  title,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  title: string;
}) {
  return (
    <details
      className="group rounded-lg border bg-background"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-sm font-semibold">
        <span>{title}</span>
        <ChevronDown className="size-4 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="border-t p-3">{children}</div>
    </details>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
      <span className="text-muted-foreground">{label}</span>
      <span className="wrap-break-word sm:text-right">{value}</span>
    </div>
  );
}

function FulfillmentEditor({
  draft,
  errors,
  inventory,
  items,
  onDraftChange,
  readOnly,
}: {
  draft: FulfillmentDraft;
  errors: Record<string, string[]>;
  inventory: FulfillmentInventoryRow[];
  items: VendorOrderItem[];
  onDraftChange: (draft: FulfillmentDraft) => void;
  readOnly: boolean;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Fulfillment</h3>
        <p className="text-sm text-muted-foreground">
          Allocate every ordered SKU to one or more stores before accepting.
        </p>
      </div>
      {items.map((item) => (
        <FulfillmentItemEditor
          draftRows={draft[item.id] ?? []}
          errors={errors[item.id] ?? []}
          inventory={inventory}
          item={item}
          key={item.id}
          onChange={(rows) => onDraftChange({ ...draft, [item.id]: rows })}
          readOnly={readOnly}
        />
      ))}
    </section>
  );
}

function FulfillmentItemEditor({
  draftRows,
  errors,
  inventory,
  item,
  onChange,
  readOnly,
}: {
  draftRows: Array<{ quantity: number; storeId: string }>;
  errors: string[];
  inventory: FulfillmentInventoryRow[];
  item: VendorOrderItem;
  onChange: (rows: Array<{ quantity: number; storeId: string }>) => void;
  readOnly: boolean;
}) {
  const stores = inventory.filter(
    (row) => row.variantId === item.variantId && row.isActive !== false,
  );
  const allocated = draftRows.reduce((total, row) => total + Number(row.quantity), 0);

  function updateRow(index: number, next: { quantity?: number; storeId?: string }) {
    onChange(
      draftRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...next } : row,
      ),
    );
  }

  function addRow() {
    onChange([
      ...draftRows,
      {
        quantity: Math.max(item.quantity - allocated, 1),
        storeId: stores[0]?.storeId ?? "",
      },
    ]);
  }

  function removeRow(index: number) {
    onChange(draftRows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="rounded-lg border p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{item.productName}</p>
          <p className="text-xs text-muted-foreground">
            SKU {item.sku} | {formatVariantAttributes(item.variantAttributes)}
          </p>
        </div>
        <Badge variant={allocated === item.quantity ? "secondary" : "outline-solid"}>
          {allocated}/{item.quantity}
        </Badge>
      </div>

      <div className="mt-3 space-y-2">
        {draftRows.length === 0 ? (
          <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            No store allocation yet.
          </p>
        ) : (
          draftRows.map((row, index) => (
            <div
              className="grid gap-2 rounded-md border p-2 sm:grid-cols-[1fr_100px_auto]"
              key={`${row.storeId}-${index}`}
            >
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs disabled:opacity-60"
                disabled={readOnly}
                onChange={(event) =>
                  updateRow(index, { storeId: event.target.value })
                }
                value={row.storeId}
              >
                <option value="">Select store</option>
                {stores.map((store) => (
                  <option key={store.storeId} value={store.storeId}>
                    {store.storeName} ({store.availableQuantity} available)
                  </option>
                ))}
              </select>
              <Input
                disabled={readOnly}
                min={1}
                onChange={(event) =>
                  updateRow(index, { quantity: Number(event.target.value) })
                }
                type="number"
                value={row.quantity}
              />
              <Button
                disabled={readOnly}
                onClick={() => removeRow(index)}
                type="button"
                variant="ghost"
              >
                Remove
              </Button>
            </div>
          ))
        )}
      </div>

      {errors.length > 0 && (
        <div className="mt-2 space-y-1 text-sm text-destructive">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      {!readOnly && (
        <Button className="mt-3" onClick={addRow} size="sm" type="button" variant="outline">
          Add store split
        </Button>
      )}
    </div>
  );
}

function StatusPrimaryAction({
  canAccept,
  isLoading,
  onAccept,
  onStatusUpdate,
  status,
}: {
  canAccept: boolean;
  isLoading: boolean;
  onAccept: () => void;
  onStatusUpdate: (status: string) => Promise<void>;
  status: string;
}) {
  const nextStatus = nextVendorStatus(status);

  if (status === "placed") {
    return (
      <Button disabled={!canAccept || isLoading} onClick={onAccept} type="button">
        <CheckCircle2 className="size-4" />
        Accept order
      </Button>
    );
  }

  if (!nextStatus) {
    return null;
  }

  return (
    <Button
      disabled={isLoading}
      onClick={() => void onStatusUpdate(nextStatus)}
      type="button"
    >
      Mark {nextStatus}
    </Button>
  );
}

function nextVendorStatus(status: string) {
  switch (status) {
    case "accepted":
      return "packed";
    case "packed":
      return "shipped";
    case "shipped":
      return "delivered";
    default:
      return "";
  }
}

function shortId(value: string) {
  return value ? value.slice(0, 8) : "-";
}

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function formatAddress(address: Record<string, unknown> | null | undefined) {
  if (!address) return "-";
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode ?? address.postal_code,
    address.country,
  ].filter((part): part is string => typeof part === "string" && part.trim().length > 0);

  return parts.length > 0 ? parts.join(", ") : "-";
}
