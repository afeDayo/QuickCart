// DeliveryMethodForm.tsx client/src/components/checkout/DeliveryMethodForm.tsx
// ③ Delivery Method: Standard (free, 2–3 business days) or Express Same-Day (₦2,500, Lagos only).
// The prices and the Lagos rule are the server's own (DELIVERY_OPTIONS and isLagos, server STEP 22).

// STEP 38 (part 7): Delivery method

import { MdBolt, MdOutlineEventAvailable } from "react-icons/md";
import type { CheckoutForm } from "../../types/checkout";
import RadioCard from "../form/RadioCard";
import CheckoutSection from "./CheckoutSection";

type DeliveryMethodFormProps = {
  value: CheckoutForm["deliveryMethod"];
  lagos: boolean; // is the chosen address in Lagos?
  onChange: (value: CheckoutForm["deliveryMethod"]) => void;
};

const DeliveryMethodForm = ({
  value,
  lagos,
  onChange,
}: DeliveryMethodFormProps) => {
  return (
    <CheckoutSection
      number={3}
      title="Delivery Method"
      subtitle="Choose the delivery speed suited to your urgency"
    >
      <div className="flex flex-col gap-3">
        <RadioCard
          name="delivery"
          value="standard"
          checked={value === "standard"}
          onChange={() => onChange("standard")}
          title="Standard Delivery"
          badge={
            <span className="rounded-full bg-mint px-2 py-0.5 text-xs font-semibold text-forest">
              Recommended
            </span>
          }
          right={<span className="text-lg font-bold text-success">Free</span>}
          description={
            <>
              2–3 business days anywhere in Nigeria · Tracking updates by email.
              <span className="mt-1 flex items-center gap-1 text-xs font-medium text-ink-soft">
                <MdOutlineEventAvailable size={14} aria-hidden="true" /> The
                exact dates are on your confirmation
              </span>
            </>
          }
        />
        <RadioCard
          name="delivery"
          value="express"
          checked={value === "express"}
          onChange={() => onChange("express")}
          disabled={!lagos}
          title="Express Same-Day Dispatch"
          badge={
            <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
              Lagos only
            </span>
          }
          right={<span className="text-lg font-bold text-ink">₦2,500</span>}
          description={
            lagos ? (
              <span className="flex items-center gap-1 font-medium text-primary-hover">
                <MdBolt size={15} aria-hidden="true" /> Delivered today across
                Lagos by a dedicated courier
              </span>
            ) : (
              "Available for Lagos addresses only."
            )
          }
        />
      </div>
    </CheckoutSection>
  );
};

export default DeliveryMethodForm;
