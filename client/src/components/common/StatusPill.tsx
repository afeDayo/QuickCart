// StatusPill.tsx client/src/components/common/StatusPill.tsx
// "● Processing" / "Shipped" / "✓ Delivered" / "Cancelled": an order's status as a coloured pill.
// Used on My Account (STEP 39), Order History and Order Details (STEP 40), and the admin orders (STEP 43).

// STEP 39 (part 1): The status pill

import type { OrderStatus } from "../../types/api";

const STYLES: Record<OrderStatus, { label: string; classes: string }> = {
  processing: { label: "Processing", classes: "bg-[#fff4e0] text-[#8a5300]" },
  shipped: { label: "Shipped", classes: "bg-info-light text-primary" },
  delivered: { label: "Delivered", classes: "bg-mint/40 text-forest" },
  cancelled: { label: "Cancelled", classes: "bg-danger-light text-danger" },
};

const StatusPill = ({ status }: { status: OrderStatus }) => {
  const { label, classes } = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${classes}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

export default StatusPill;
