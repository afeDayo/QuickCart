// OrderTracker.tsx client/src/components/order/OrderTracker.tsx
// "Order Progress": Order Placed → Packing & Quality Check → Dispatched → Delivered, with the time of each step that
// has happened (the order's statusHistory, server STEP 22 and the admin's moves in STEP 26).
// Used on the Order Confirmation page, and Order Details in STEP 40.

// STEP 38 (part 11): The order tracker

import type { IconType } from "react-icons";
import {
  MdCheck,
  MdClose,
  MdOutlineInventory2,
  MdOutlineLocalShipping,
  MdOutlinePlace,
} from "react-icons/md";
import type { Order } from "../../types/api";
import { shortDateTime } from "../../utils/dates";

type Step = { title: string; text: string; icon: IconType; doneAt?: string };

const OrderTracker = ({ order }: { order: Order }) => {
  const timeOf = (status: Order["status"]) =>
    order.statusHistory.find((update) => update.status === status)?.at;

  if (order.status === "cancelled") {
    return (
      <div className="flex gap-4 rounded-2xl bg-danger-light p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger text-white">
          <MdClose size={20} aria-hidden="true" />
        </span>
        <p className="text-sm text-ink-soft">
          <span className="block text-lg font-semibold text-ink">
            Order cancelled
          </span>
          {order.cancelledAt && `${shortDateTime(order.cancelledAt)} · `}
          {order.payment.status === "refunded"
            ? "Your payment is being refunded."
            : "You were not charged."}
          {order.cancelReason && (
            <span className="block">Reason: {order.cancelReason}</span>
          )}
        </p>
      </div>
    );
  }

  const steps: Step[] = [
    {
      title: "Order Placed",
      text: "Payment confirmed & sent to the warehouse.",
      icon: MdCheck,
      doneAt: order.createdAt,
    },
    {
      title: "Packing & Quality Check",
      text: "Our fulfilment centre is preparing your box.",
      icon: MdOutlineInventory2,
      doneAt: order.createdAt,
    },
    {
      title: "Dispatched",
      text: order.courier
        ? `With ${order.courier} · Waybill ${order.waybill}`
        : "Courier allocation in progress.",
      icon: MdOutlineLocalShipping,
      doneAt: timeOf("shipped"),
    },
    {
      title: "Delivered",
      text: "Direct handover to the recipient.",
      icon: MdOutlinePlace,
      doneAt: order.deliveredAt ?? timeOf("delivered"),
    },
  ];

  // The "current" step is the first one not done yet (the packing step counts as current while processing)
  const current =
    order.status === "processing" ? 1 : order.status === "shipped" ? 3 : 4;

  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const done =
          index < current ||
          (index === current && order.status === "delivered");
        const active = index === current && order.status !== "delivered";
        return (
          <li
            key={step.title}
            className="relative flex gap-4 pb-6 last:pb-0"
            aria-current={active ? "step" : undefined}
          >
            {/* The line joining the circles (not after the last one) */}
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute top-10 left-5 h-[calc(100%-2.5rem)] w-0.5 ${done ? "bg-primary" : "bg-line-soft"}`}
              />
            )}
            <span
              className={`relative flex size-10 shrink-0 items-center justify-center rounded-full ${
                done
                  ? "bg-primary text-white"
                  : active
                    ? "bg-primary-light text-primary ring-4 ring-primary-light/50"
                    : "bg-field text-muted"
              }`}
            >
              <step.icon size={20} aria-hidden="true" />
            </span>
            <div className="pt-1">
              <p
                className={`flex flex-wrap items-center gap-2 font-semibold ${done || active ? "text-ink" : "text-muted"} ${active ? "text-primary!" : ""}`}
              >
                {step.title}
                {active && (
                  <span className="rounded-md bg-primary-light px-1.5 py-0.5 text-[11px] text-primary">
                    Current
                  </span>
                )}
                {done && step.doneAt && index !== 1 && (
                  <span className="text-xs font-medium text-muted">
                    {shortDateTime(step.doneAt)}
                  </span>
                )}
              </p>
              <p
                className={`text-sm ${done || active ? "text-ink-soft" : "text-muted"}`}
              >
                {step.text}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default OrderTracker;
