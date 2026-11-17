// FreeDeliveryBar.tsx client/src/components/cart/FreeDeliveryBar.tsx
// The green bar above the cart lines. Your server makes Standard Delivery free on every order (DELIVERY_OPTIONS,
// server STEP 22), so it says that, and how much the sale prices are saving you.

// STEP 36 (part 4): The delivery bar

import { MdOutlineLocalShipping } from "react-icons/md";
import { naira } from "../../utils/format";

const FreeDeliveryBar = ({ saved }: { saved: number }) => {
  return (
    <div className="rounded-3xl bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="flex items-center gap-2 font-medium text-success">
          <MdOutlineLocalShipping size={20} aria-hidden="true" /> Good news!
          Standard delivery is free on your order
        </p>
        {saved > 0 && (
          <p className="font-semibold tracking-wide text-ink-soft">
            Saved {naira(saved)}
          </p>
        )}
      </div>
      <div
        aria-hidden="true"
        className="mt-2 h-1.5 origin-left animate-grow-x rounded-full bg-success"
      />
    </div>
  );
};

export default FreeDeliveryBar;
