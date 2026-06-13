function readActive(row) {
  if (typeof row?.isActive === "boolean") return row.isActive;
  if (typeof row?.is_active === "boolean") return row.is_active;
  return true;
}

function countRows(rows, options = {}) {
  return rows.reduce(
    (summary, row) => {
      summary.total += 1;

      if (options.includeSuspended && row?.platform_status && row.platform_status !== "active") {
        summary.suspended += 1;
        return summary;
      }

      if (readActive(row)) {
        summary.active += 1;
      } else {
        summary.inactive += 1;
      }

      return summary;
    },
    options.includeSuspended
      ? { active: 0, inactive: 0, suspended: 0, total: 0 }
      : { active: 0, inactive: 0, total: 0 },
  );
}

export function summarizeVendorDashboard({ brands = [], products = [], stores = [] }) {
  return {
    brands: countRows(brands),
    products: countRows(products, { includeSuspended: true }),
    stores: countRows(stores),
  };
}

export function summarizeVendorOrders(orders = []) {
  const byStatus = {};

  for (const order of orders) {
    const status = order?.status || "unknown";
    byStatus[status] = (byStatus[status] ?? 0) + 1;
  }

  const closed = (byStatus.delivered ?? 0) + (byStatus.canceled ?? 0) + (byStatus.cancelled ?? 0);

  return {
    total: orders.length,
    open: Math.max(orders.length - closed, 0),
    byStatus,
  };
}
