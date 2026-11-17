// DeliveryAddressForm.tsx client/src/components/checkout/DeliveryAddressForm.tsx
// ② Delivery Address: pick one of your saved addresses (My Account, server STEP 20), or type a new one.

// STEP 38 (part 6): Delivery address

import { MdOutlinePlace } from "react-icons/md";
import type { Address } from "../../types/api";
import type {
  ChangeField,
  CheckoutErrors,
  CheckoutForm,
} from "../../types/checkout";
import { NIGERIAN_STATES } from "../../utils/nigeria";
import RadioCard from "../form/RadioCard";
import TextInput from "../form/TextInput";
import CheckoutSection from "./CheckoutSection";

type DeliveryAddressFormProps = {
  form: CheckoutForm;
  errors: CheckoutErrors;
  onChange: ChangeField;
  saved: Address[];
};

const DeliveryAddressForm = ({
  form,
  errors,
  onChange,
  saved,
}: DeliveryAddressFormProps) => {
  const typingNew = form.addressId === "new";

  return (
    <CheckoutSection
      number={2}
      title="Delivery Address"
      subtitle="Specify where you'd like your packages delivered"
    >
      <div className="flex flex-col gap-3">
        {saved.map((address) => (
          <RadioCard
            key={address._id}
            name="address"
            value={address._id}
            checked={form.addressId === address._id}
            onChange={(value) => onChange("addressId", value)}
            title={address.label}
            badge={
              address.isDefault && (
                <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
                  Default
                </span>
              )
            }
            description={`${address.fullName} · ${address.street}, ${address.city}, ${address.state}`}
          />
        ))}
        {saved.length > 0 && (
          <RadioCard
            name="address"
            value="new"
            checked={typingNew}
            onChange={(value) => onChange("addressId", value)}
            title="Use a new address"
          />
        )}
      </div>

      {/* The address boxes: always when there are no saved addresses, otherwise only for "Use a new address" */}
      {(typingNew || saved.length === 0) && (
        <div
          className={`grid gap-5 sm:grid-cols-2 ${saved.length > 0 ? "mt-5" : ""}`}
        >
          <TextInput
            className="sm:col-span-2"
            label="Street Address"
            autoComplete="street-address"
            icon={MdOutlinePlace}
            placeholder="12 Admiralty Way"
            value={form.street}
            onChange={(e) => onChange("street", e.target.value)}
            error={errors.street}
          />
          <TextInput
            label="City / Neighborhood"
            autoComplete="address-level2"
            placeholder="Lekki Phase 1"
            value={form.city}
            onChange={(e) => onChange("city", e.target.value)}
            error={errors.city}
          />
          <div>
            <label
              htmlFor="checkout-state"
              className="mb-2 block text-sm font-medium text-ink"
            >
              State / Region
            </label>
            <select
              id="checkout-state"
              value={form.state}
              onChange={(e) => onChange("state", e.target.value)}
              aria-invalid={errors.state ? true : undefined}
              className="h-12 w-full cursor-pointer rounded-xl bg-field px-4 text-[15px] text-ink outline-none focus:ring-2 focus:ring-primary/30 aria-invalid:ring-2 aria-invalid:ring-danger/40"
            >
              <option value="">Choose a state</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1.5 text-[13px] text-danger">{errors.state}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="checkout-instructions"
              className="mb-2 block text-sm font-medium text-ink"
            >
              Delivery Instructions{" "}
              <span className="font-normal text-muted">(Optional)</span>
            </label>
            <textarea
              id="checkout-instructions"
              rows={3}
              maxLength={300}
              placeholder="Gate code 4022. Please call upon arrival at reception."
              value={form.instructions}
              onChange={(e) => onChange("instructions", e.target.value)}
              className="w-full rounded-xl bg-field px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      )}
    </CheckoutSection>
  );
};

export default DeliveryAddressForm;
