// AdminStatCard.tsx client/src/components/admin/AdminStatCard.tsx
// A small number card at the top of the admin lists: "TOTAL ITEMS 40", "LOW / CRITICAL 6 Action Needed"...
// Used on Products (STEP 42) and Orders (STEP 43).

// STEP 42 (part 1): A stat card

import type { ReactNode } from "react";
import type { IconType } from "react-icons";

type AdminStatCardProps = {
  label: string;
  value: number | string;
  icon: IconType;
  note?: ReactNode; // the small text or pill next to the number
  danger?: boolean; // the red style for "needs attention"
};

const AdminStatCard = ({
  label,
  value,
  icon: Icon,
  note,
  danger,
}: AdminStatCardProps) => {
  return (
    <div
      className={`overflow-hidden rounded-3xl bg-surface p-5 shadow-card ${danger ? "ring-1 ring-danger/20" : ""}`}
    >
      <div className="flex items-start justify-between">
        <p
          className={`text-sm font-semibold tracking-wide uppercase ${danger ? "text-danger" : "text-ink-soft"}`}
        >
          {label}
        </p>
        <Icon
          size={22}
          aria-hidden="true"
          className={danger ? "text-danger" : "text-ink-soft"}
        />
      </div>
      <p className="mt-2 flex flex-wrap items-baseline gap-2">
        <span
          className={`text-4xl font-bold ${danger ? "text-danger" : "text-ink"}`}
        >
          {value}
        </span>
        {note && (
          <span className="text-sm font-medium text-ink-soft">{note}</span>
        )}
      </p>
    </div>
  );
};

export default AdminStatCard;
