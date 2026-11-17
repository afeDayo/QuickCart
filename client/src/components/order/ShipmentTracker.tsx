// ShipmentTracker.tsx client/src/components/order/ShipmentTracker.tsx
// The top-left box of Order Details: carrier, estimated delivery and waybill, the 4 steps side by side
// (Placed → Processing → Dispatched → Delivered), and the latest update from the order's history.

// STEP 40 (part 4): The shipment tracker

import {
  MdCheck,
  MdOutlineAutorenew,
  MdOutlineInventory2,
  MdOutlineLocalShipping,
  MdOutlineUpdate,
} from "react-icons/md";
import type { Order } from "../../types/api";
import { shortDate, shortDateTime } from "../../utils/dates";
import OrderTracker from "./OrderTracker";

const ShipmentTracker = ({ order }: { order: Order }) => {
  const latest = order.statusHistory[order.statusHistory.length - 1];
  const shippedAt = order.statusHistory.find(
    (update) => update.status === "shipped",
  )?.at;
  const deliveryWindow =
    order.estimatedDelivery.from === order.estimatedDelivery.to
      ? shortDate(order.estimatedDelivery.from)
      : `${shortDate(order.estimatedDelivery.from)} – ${shortDate(order.estimatedDelivery.to)}`;

  // Done / current / waiting for each of the 4 steps
  const reached =
    order.status === "processing" ? 1 : order.status === "shipped" ? 2 : 3;
  const steps = [
    {
      title: "Order Placed",
      when: shortDateTime(order.createdAt),
      icon: MdCheck,
    },
    {
      title: "Processing & Quality",
      when: "Fulfilment centre",
      icon: MdOutlineAutorenew,
    },
    {
      title: "Dispatched",
      when: shippedAt ? shortDateTime(shippedAt) : "Pending handover",
      icon: MdOutlineLocalShipping,
    },
    {
      title: "Delivered",
      when: order.deliveredAt
        ? shortDateTime(order.deliveredAt)
        : `Est. ${deliveryWindow}`,
      icon: MdOutlineInventory2,
    },
  ];

  return (
    <section
      aria-label="Shipment tracking"
      className="rounded-3xl bg-surface p-6 shadow-card"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-panel p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-light text-primary">
            <MdOutlineLocalShipping size={22} aria-hidden="true" />
          </span>
          <p>
            <span className="block text-xs font-bold tracking-wider text-ink-soft uppercase">
              Carrier:{" "}
              {order.courier ??
                (order.deliveryMethod === "express"
                  ? "Express same-day dispatch"
                  : "To be assigned")}
            </span>
            <span className="text-xl font-semibold text-ink">
              {order.status === "delivered"
                ? `Delivered ${order.deliveredAt ? shortDate(order.deliveredAt) : ""}`
                : `Estimated Delivery: ${deliveryWindow}`}
            </span>
          </p>
        </div>
        {order.waybill && (
          <p className="text-right">
            <span className="block text-xs font-semibold text-ink-soft">
              Waybill Number
            </span>
            <span className="font-mono font-bold text-primary-hover">
              {order.waybill}
            </span>
          </p>
        )}
      </div>

      {order.status === "cancelled" ? (
        <OrderTracker order={order} /> // the red "Order cancelled" box (STEP 38)
      ) : (
        <ol className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
          {steps.map((step, index) => {
            const done = index < reached || order.status === "delivered";
            const current = index === reached && order.status !== "delivered";
            return (
              <li
                key={step.title}
                aria-current={current ? "step" : undefined}
                className="relative flex flex-col items-center text-center"
              >
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className={`absolute top-5 right-1/2 hidden h-0.5 w-full sm:block ${done || current ? "bg-success" : "bg-line-soft"}`}
                  />
                )}
                <span
                  className={`relative flex size-10 items-center justify-center rounded-full ${
                    done
                      ? "bg-forest text-white"
                      : current
                        ? "bg-primary text-white ring-4 ring-primary-light"
                        : "bg-field text-muted"
                  }`}
                >
                  <step.icon size={20} aria-hidden="true" />
                </span>
                <span
                  className={`mt-2 font-semibold ${current ? "text-primary" : done ? "text-ink" : "text-muted"}`}
                >
                  {step.title}
                </span>
                <span className="text-xs text-muted">{step.when}</span>
              </li>
            );
          })}
        </ol>
      )}

      {latest && order.status !== "cancelled" && (
        <p className="mt-6 flex gap-3 rounded-2xl bg-info-light/60 p-4 text-sm">
          <MdOutlineUpdate
            size={20}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-primary"
          />
          <span>
            <span className="block font-semibold text-ink">
              Latest Update: {latest.note}
            </span>
            <span className="text-ink-soft">{shortDateTime(latest.at)}</span>
          </span>
        </p>
      )}
    </section>
  );
};

export default ShipmentTracker;
