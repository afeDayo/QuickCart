// PaymentMethodForm.tsx client/src/components/checkout/PaymentMethodForm.tsx
// ④ Payment Method: Card, or Pay on Delivery (Lagos only).
// The card payment is SIMULATED (server STEP 22): no real money moves, the server only keeps the brand and the last
// 4 digits, and a card number ending in 0000 is declined so you can show what a failed payment looks like.

// STEP 38 (part 8): Payment method

import { MdLockOutline, MdOutlineCreditCard } from "react-icons/md";
import type {
  ChangeField,
  CheckoutErrors,
  CheckoutForm,
} from "../../types/checkout";
import RadioCard from "../form/RadioCard";
import TextInput from "../form/TextInput";
import CheckoutSection from "./CheckoutSection";

// "4242424242424242" -> "4242 4242 4242 4242" (easier to read and check)
const groupDigits = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

// "0828" -> "08/28"
const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
};

type PaymentMethodFormProps = {
  form: CheckoutForm;
  errors: CheckoutErrors;
  onChange: ChangeField;
  lagos: boolean;
};

const PaymentMethodForm = ({
  form,
  errors,
  onChange,
  lagos,
}: PaymentMethodFormProps) => {
  return (
    <CheckoutSection
      number={4}
      title="Payment Method"
      subtitle="Card details go straight to our payment step, never stored"
      badge={
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ink-soft">
          <MdLockOutline size={14} aria-hidden="true" /> 256-Bit SSL
        </span>
      }
    >
      <div className="flex flex-col gap-3">
        <RadioCard
          name="payment"
          value="card"
          checked={form.paymentMethod === "card"}
          onChange={() => onChange("paymentMethod", "card")}
          title="Card Payment"
          badge={
            <span className="rounded-full bg-mint px-2 py-0.5 text-xs font-semibold text-forest">
              Instant Confirmation
            </span>
          }
          description="Pay securely with Mastercard, Visa or Verve."
        >
          <div className="grid gap-4 rounded-2xl bg-surface p-4 shadow-card sm:grid-cols-2">
            <TextInput
              className="sm:col-span-2"
              label="Card Number"
              inputMode="numeric"
              autoComplete="cc-number"
              icon={MdOutlineCreditCard}
              placeholder="4242 4242 4242 4242"
              value={form.cardNumber}
              onChange={(e) =>
                onChange("cardNumber", groupDigits(e.target.value))
              }
              error={errors.cardNumber}
            />
            <TextInput
              label="Expiry"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={form.expiry}
              onChange={(e) => onChange("expiry", formatExpiry(e.target.value))}
              error={errors.expiry}
            />
            <TextInput
              label="CVV"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              maxLength={4}
              value={form.cvv}
              onChange={(e) =>
                onChange("cvv", e.target.value.replace(/\D/g, ""))
              }
              error={errors.cvv}
            />
          </div>
          <p className="mt-3 rounded-xl bg-panel px-4 py-2.5 text-xs text-ink-soft">
            Simulated payment for this capstone: no money moves. Try any
            valid-looking card; a number ending in <strong>0000</strong> is
            declined.
          </p>
        </RadioCard>

        <RadioCard
          name="payment"
          value="pay_on_delivery"
          checked={form.paymentMethod === "pay_on_delivery"}
          onChange={() => onChange("paymentMethod", "pay_on_delivery")}
          disabled={!lagos}
          title="Pay on Delivery (Cash or POS)"
          badge={
            <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
              Lagos Metro Only
            </span>
          }
          description={
            lagos
              ? "Pay the rider by card or cash when your order arrives."
              : "Available for Lagos addresses only."
          }
        />
      </div>
    </CheckoutSection>
  );
};

export default PaymentMethodForm;
