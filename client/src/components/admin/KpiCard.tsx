// KpiCard.tsx client/src/components/admin/KpiCard.tsx
// One of the 4 cards at the top of the dashboard: "TOTAL SALES ₦18,450,200 ↗ +14.2% vs. previous period".

// STEP 41 (part 6): A KPI card

import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { MdTrendingDown, MdTrendingUp } from "react-icons/md";

type KpiCardProps = {
  label: string;
  value: string;
  icon: IconType;
  tile: string; // the icon's colours
  change?: number | null; // % vs the previous period (null = nothing to compare with)
  footer?: ReactNode; // anything else at the bottom, e.g. "4 Low Stock · Needs restock"
};

const KpiCard = ({
  label,
  value,
  icon: Icon,
  tile,
  change,
  footer,
}: KpiCardProps) => {
  return (
    <div className="flex flex-col rounded-3xl bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold tracking-wide text-ink-soft uppercase">
          {label}
        </p>
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tile}`}
        >
          <Icon size={22} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{value}</p>
      <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-sm text-ink-soft">
        {change !== undefined &&
          (change === null ? (
            <span className="rounded-full bg-field px-2 py-0.5 text-xs font-semibold">
              New
            </span>
          ) : (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${change >= 0 ? "bg-mint/40 text-forest" : "bg-danger-light text-danger"}`}
            >
              {change >= 0 ? (
                <MdTrendingUp size={14} aria-hidden="true" />
              ) : (
                <MdTrendingDown size={14} aria-hidden="true" />
              )}
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
          ))}
        {change !== undefined && <span>vs. previous period</span>}
        {footer}
      </div>
    </div>
  );
};

export default KpiCard;
