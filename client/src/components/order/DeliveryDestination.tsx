// DeliveryDestination.tsx client/src/components/order/DeliveryDestination.tsx
// "Delivery Destination": who receives it, where, how fast, and the rider instructions.

// STEP 40 (part 6): Delivery destination

import {
  MdOutlineChatBubbleOutline,
  MdOutlinePlace,
  MdOutlineVerifiedUser,
} from "react-icons/md";
import type { Order } from "../../types/api";
import { localPhone } from "../../utils/nigeria";

const DeliveryDestination = ({ order }: { order: Order }) => {
  const address = order.shippingAddress;
  return (
    <section
      aria-labelledby="destination-title"
      className="rounded-3xl bg-surface p-6 shadow-card"
    >
      <h2
        id="destination-title"
        className="mb-4 flex items-center gap-2 text-xl font-semibold text-ink"
      >
        <MdOutlinePlace size={22} aria-hidden="true" className="text-primary" />{" "}
        Delivery Destination
      </h2>
      <div className="rounded-2xl bg-panel p-4">
        <p className="flex items-center justify-between gap-2">
          <span className="text-lg font-semibold text-ink">
            {address.fullName}
          </span>
          {address.label && (
            <span className="rounded-md bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
              {address.label}
            </span>
          )}
        </p>
        <p className="text-sm text-ink-soft">{localPhone(address.phone)}</p>
        <p className="mt-2 text-ink">
          {address.street}, {address.city},
          <br />
          {address.state}, {address.country}
        </p>
      </div>
      <p className="mt-4 flex items-start gap-2 text-sm text-ink-soft">
        <MdOutlineVerifiedUser
          size={18}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-success"
        />
        {order.deliveryMethod === "express"
          ? "Express Same-Day Dispatch (Lagos)"
          : "Standard Delivery (2–3 business days, insured)"}
      </p>
      {address.instructions && (
        <p className="mt-3 flex gap-2 rounded-2xl bg-panel p-3 text-sm text-ink-soft">
          <MdOutlineChatBubbleOutline
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          <span>
            <span className="block text-xs font-bold tracking-wider uppercase">
              Rider instructions:
            </span>
            "{address.instructions}"
          </span>
        </p>
      )}
    </section>
  );
};

export default DeliveryDestination;
