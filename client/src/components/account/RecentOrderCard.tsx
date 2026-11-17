// RecentOrderCard.tsx client/src/components/account/RecentOrderCard.tsx
// One order in "Recent Orders": number, date, status, total, the items as small chips, a line that depends on the
// status (delivery window / courier and waybill / delivered), and View Details.

// STEP 39 (part 7): A recent order

import {
  MdChevronRight,
  MdOutlineCalendarMonth,
  MdOutlineLocalShipping,
  MdOutlinePlace,
} from "react-icons/md";
import { Link } from "react-router-dom";
import type { Order } from "../../types/api";
import { shortDate } from "../../utils/dates";
import { naira } from "../../utils/format";
import StatusPill from "../common/StatusPill";

const RecentOrderCard = ({ order }: { order: Order }) => {
  // The line under the items changes with the order's status
  const detail =
    order.status === "processing"
      ? {
          icon: MdOutlineCalendarMonth,
          text: `Estimated delivery: ${shortDate(order.estimatedDelivery.from)} – ${shortDate(order.estimatedDelivery.to)}`,
        }
      : order.status === "shipped"
        ? {
            icon: MdOutlineLocalShipping,
            text: `In transit with ${order.courier} (Waybill ${order.waybill})`,
          }
        : order.status === "delivered"
          ? {
              icon: MdOutlinePlace,
              text: `Delivered to ${order.shippingAddress.city}${order.deliveredAt ? ` on ${shortDate(order.deliveredAt)}` : ""}`,
            }
          : { icon: MdOutlinePlace, text: "This order was cancelled" };

  return (
    <li className="rounded-3xl bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <p className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold text-ink">
            Order #{order.orderNumber}
          </span>
          <span className="text-sm text-muted">
            · Placed {shortDate(order.createdAt)}
          </span>
          <StatusPill status={order.status} />
        </p>
        <p className="text-lg font-bold text-ink">{naira(order.total)}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <ul className="flex flex-wrap gap-2">
            {order.items.map((item) => (
              <li
                key={`${item.product}-${item.color}`}
                className="rounded-lg bg-panel px-3 py-1.5 text-sm text-ink"
              >
                {item.name}{" "}
                <span className="ml-1 font-semibold text-ink-soft">
                  x{item.quantity}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
            <detail.icon size={16} aria-hidden="true" /> {detail.text}
          </p>
        </div>
        <Link
          to={`/account/orders/${order.orderNumber}`}
          className={`flex h-10 shrink-0 items-center gap-1 rounded-xl px-4 text-sm font-semibold ${
            order.status === "processing"
              ? "bg-primary text-white hover:bg-primary-hover"
              : "bg-field text-ink hover:bg-primary-light"
          }`}
        >
          View Details <MdChevronRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
};

export default RecentOrderCard;
