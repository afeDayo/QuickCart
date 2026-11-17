// AccountStats.tsx client/src/components/account/AccountStats.tsx
// The 4 boxes at the top of My Account: Total Orders, In Progress, Delivered, Saved Places.

// STEP 39 (part 4): Account stats

import type { IconType } from "react-icons";
import {
  MdOutlineCheckCircle,
  MdOutlineLocalShipping,
  MdOutlinePlace,
  MdOutlineReceiptLong,
} from "react-icons/md";

type Stat = {
  label: string;
  value: number;
  unit: string;
  note: string;
  icon: IconType;
  tile: string;
};

type AccountStatsProps = {
  totalOrders: number;
  inProgress: number;
  delivered: number;
  addresses: number;
  defaultCity?: string;
  activeOrder?: string;
};

const AccountStats = ({
  totalOrders,
  inProgress,
  delivered,
  addresses,
  defaultCity,
  activeOrder,
}: AccountStatsProps) => {
  const stats: Stat[] = [
    {
      label: "Total orders",
      value: totalOrders,
      unit: "orders",
      note: "Lifetime purchases",
      icon: MdOutlineReceiptLong,
      tile: "bg-primary-light text-primary",
    },
    {
      label: "In progress",
      value: inProgress,
      unit: "active",
      note: activeOrder ? `#${activeOrder} on its way` : "Nothing on the way",
      icon: MdOutlineLocalShipping,
      tile: "bg-info-light text-primary",
    },
    {
      label: "Delivered",
      value: delivered,
      unit: "packages",
      note: "Received and signed for",
      icon: MdOutlineCheckCircle,
      tile: "bg-mint text-forest",
    },
    {
      label: "Saved places",
      value: addresses,
      unit: addresses === 1 ? "location" : "locations",
      note: defaultCity ? `Default: ${defaultCity}` : "No address yet",
      icon: MdOutlinePlace,
      tile: "bg-field text-ink-soft",
    },
  ];

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <li key={stat.label} className="rounded-3xl bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between">
            <p className="text-xs font-bold tracking-wider text-ink-soft uppercase">
              {stat.label}
            </p>
            <span
              className={`flex size-9 items-center justify-center rounded-lg ${stat.tile}`}
            >
              <stat.icon size={20} aria-hidden="true" />
            </span>
          </div>
          <p className="mt-1">
            <span className="text-3xl font-bold text-ink">{stat.value}</span>{" "}
            <span className="text-sm text-ink-soft">{stat.unit}</span>
          </p>
          <p className="mt-1 truncate text-xs font-semibold text-muted">
            {stat.note}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default AccountStats;
