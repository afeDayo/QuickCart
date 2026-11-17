// AddressForm.tsx client/src/components/account/AddressForm.tsx
// Add a new address, or edit one (the same form, filled in). Sends POST or PATCH /api/account/addresses
// (server STEP 20), which answers with the whole new list.

// STEP 39 (part 11): The address form

import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import type { Address } from "../../types/api";
import { api } from "../../utils/api";
import {
  localPhone,
  NIGERIAN_STATES,
  toInternational,
} from "../../utils/nigeria";
import Checkbox from "../form/Checkbox";
import TextInput from "../form/TextInput";

type AddressFormProps = {
  address?: Address; // given = edit it; missing = add a new one
  onDone: (message: string) => void;
  onCancel: () => void;
};

const AddressForm = ({ address, onDone, onCancel }: AddressFormProps) => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    label: address?.label ?? "Home",
    fullName:
      address?.fullName ??
      `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
    phone: localPhone(address?.phone ?? user?.phone),
    street: address?.street ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    instructions: address?.instructions ?? "",
    isDefault: address?.isDefault ?? (user?.addresses.length ?? 0) === 0, // the first address is the default
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !form.fullName.trim() ||
      !form.street.trim() ||
      !form.city.trim() ||
      !form.state ||
      !form.phone.trim()
    ) {
      return setError(
        "Please fill in the name, phone, street, city and state.",
      );
    }
    setError("");
    setSaving(true);
    try {
      const body = {
        ...form,
        phone: toInternational(form.phone),
        country: "Nigeria",
      };
      const { addresses } = await api<{ addresses: Address[] }>(
        address ? `/account/addresses/${address._id}` : "/account/addresses",
        {
          method: address ? "PATCH" : "POST",
          body,
        },
      );
      if (user) setUser({ ...user, addresses }); // the menu count, checkout and the Overview all use user.addresses
      onDone(address ? "Address updated." : "Address added.");
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl bg-surface p-6 shadow-card"
    >
      <h2 className="mb-5 text-xl font-semibold text-ink">
        {address ? `Edit "${address.label}"` : "Add New Address"}
      </h2>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Label (e.g. Home, Office)"
          value={form.label}
          onChange={(e) => set("label", e.target.value)}
        />
        <TextInput
          label="Receiver's Full Name"
          autoComplete="name"
          value={form.fullName}
          onChange={(e) => set("fullName", e.target.value)}
        />
        <TextInput
          label="Receiver's Phone"
          type="tel"
          autoComplete="tel-national"
          placeholder="0803 123 4567"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
        <TextInput
          label="Street Address"
          autoComplete="street-address"
          value={form.street}
          onChange={(e) => set("street", e.target.value)}
        />
        <TextInput
          label="City / Neighborhood"
          autoComplete="address-level2"
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
        />
        <div>
          <label
            htmlFor="address-state"
            className="mb-2 block text-sm font-medium text-ink"
          >
            State
          </label>
          <select
            id="address-state"
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
            className="h-12 w-full cursor-pointer rounded-xl bg-field px-4 text-[15px] outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Choose a state</option>
            {NIGERIAN_STATES.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
        </div>
        <TextInput
          className="sm:col-span-2"
          label="Delivery Instructions (optional)"
          value={form.instructions}
          onChange={(e) => set("instructions", e.target.value)}
        />
      </div>

      <Checkbox
        className="mt-4"
        checked={form.isDefault}
        onChange={(e) => set("isDefault", e.target.checked)}
      >
        Use as my default address
      </Checkbox>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-xl px-5 font-medium text-ink hover:bg-field"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Address"}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
