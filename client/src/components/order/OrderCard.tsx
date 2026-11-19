// OrderCard.tsx client/src/components/order/OrderCard.tsx
// One order on the Order History page (design: Full Order History & Filters): number, status, date, item count, total,
// a coloured line for the status, the items, and the buttons that make sense for that status.

// STEP 40 (part 2): An order card

import {
  MdCheckCircleOutline,
  MdOutlineCancel,
  MdOutlineLocalShipping,
  MdOutlineRateReview,
  MdOutlineReplay,
  MdOutlineTrackChanges,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { useBuyAgain } from "../../hooks/useBuyAgain";
import type { Order } from "../../types/api";
import { longDate, shortDate } from "../../utils/dates";
import { naira, plural } from "../../utils/format";
import StatusPill from "../common/StatusPill";

const OrderCard = ({ order }: { order: Order }) => {
  const buyAgain = useBuyAgain();
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const details = `/account/orders/${order.orderNumber}`;

  // The line under the header, like the design
  const band =
    order.status === "processing" ? (
      <p className="flex flex-wrap items-center gap-1.5 rounded-xl bg-panel px-4 py-2.5 text-sm text-ink">
        <MdOutlineLocalShipping
          size={18}
          aria-hidden="true"
          className="text-primary"
        />
        <span className="font-semibold text-primary">
          Estimated fulfilment &amp; delivery:
        </span>
        {shortDate(order.estimatedDelivery.from)} –{" "}
        {shortDate(order.estimatedDelivery.to)}
      </p>
    ) : order.status === "shipped" ? (
      <p className="flex flex-wrap items-center gap-1.5 rounded-xl bg-panel px-4 py-2.5 text-sm text-ink">
        <MdOutlineLocalShipping
          size={18}
          aria-hidden="true"
          className="text-primary"
        />
        Assigned Courier: {order.courier} (Waybill:{" "}
        <span className="font-semibold text-primary">{order.waybill}</span>)
      </p>
    ) : order.status === "delivered" ? (
      <p className="flex items-center gap-1.5 text-sm text-success">
        <MdCheckCircleOutline size={18} aria-hidden="true" /> Successfully
        delivered to {order.shippingAddress.city}
        {order.deliveredAt && ` on ${longDate(order.deliveredAt)}`}
      </p>
    ) : (
      <p className="flex items-center gap-1.5 text-sm text-danger">
        <MdOutlineCancel size={18} aria-hidden="true" /> Cancelled
        {order.cancelledAt && ` on ${longDate(order.cancelledAt)}`}
        {order.payment.status === "refunded" && " · payment refunded"}
      </p>
    );

  return (
    <li className="overflow-hidden rounded-3xl bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-panel/70 px-5 py-4">
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span className="text-xl font-bold text-ink">
            #{order.orderNumber}
          </span>
          <StatusPill status={order.status} />
          <span>· Placed {longDate(order.createdAt)}</span>
          <span>· {plural(count, "item")}</span>
        </p>
        <p className="text-sm text-ink-soft">
          TOTAL:{" "}
          <span className="text-xl font-bold text-ink">
            {naira(order.total)}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {band}

        <ul className="grid gap-3 md:grid-cols-2 max-md:grid-cols-1">
          {order.items.map((item) => (
            <li
              key={`${item.product}-${item.color}`}
              className="flex items-center gap-3 rounded-2xl bg-panel/60 p-3"
            >
              <img
                src={item.image}
                alt=""
                className="size-16 shrink-0 rounded-xl bg-field object-cover"
              />
              <span className="min-w-0 text-sm">
                <span className="block truncate font-semibold text-ink">
                  {item.name}
                </span>
                <span className="text-ink-soft">
                  Qty: {item.quantity}
                  {item.color && ` · ${item.color}`}
                </span>
                <span className="block font-bold text-primary-hover">
                  {naira(item.lineTotal)}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
          <Link
            to={details}
            className="flex h-10 items-center rounded-xl bg-field px-4 text-sm font-semibold text-ink hover:bg-primary-light"
          >
            View Details
          </Link>
          {order.status === "delivered" && (
            // #reviews: the product page opens on its Reviews tab (STEP 40 adds that to ProductDetailsPage)
            <Link
              to={`/product/${order.items[0].product}#reviews`}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-field px-4 text-sm font-semibold text-ink hover:bg-primary-light"
            >
              <MdOutlineRateReview size={16} aria-hidden="true" /> Leave Review
            </Link>
          )}
          {order.status !== "processing" && (
            <button
              type="button"
              onClick={() => buyAgain(order.items)}
              className={`flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold ${
                order.status === "delivered"
                  ? "bg-navy text-white hover:bg-footer"
                  : "bg-field text-ink hover:bg-primary-light"
              }`}
            >
              <MdOutlineReplay size={16} aria-hidden="true" /> Buy Again
            </button>
          )}
          {(order.status === "processing" || order.status === "shipped") && (
            <Link
              to={details}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <MdOutlineTrackChanges size={16} aria-hidden="true" />{" "}
              {order.status === "shipped" ? "Track Shipment" : "Track Order"}
            </Link>
          )}
        </div>
      </div>
    </li>
  );
};

export default OrderCard;
