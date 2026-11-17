// AddressCard.tsx client/src/components/account/AddressCard.tsx
// One saved address on the Delivery Addresses page: Edit, Set as default, Delete (with "are you sure?").

// STEP 39 (part 12): An address card

import { useState } from "react";
import { MdDeleteOutline, MdEdit, MdOutlinePlace } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { Address } from "../../types/api";
import { api } from "../../utils/api";
import { localPhone } from "../../utils/nigeria";

const AddressCard = ({
  address,
  onEdit,
}: {
  address: Address;
  onEdit: () => void;
}) => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  // Both answer with the whole new list (server STEP 20), which becomes user.addresses
  const update = async (method: "PATCH" | "DELETE", message: string) => {
    setBusy(true);
    try {
      const { addresses } = await api<{ addresses: Address[] }>(
        `/account/addresses/${address._id}`,
        {
          method,
          body: method === "PATCH" ? { isDefault: true } : undefined,
        },
      );
      if (user) setUser({ ...user, addresses });
      showToast({ type: "success", title: message });
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't update the address",
        message: (err as Error).message,
      });
      setBusy(false);
    }
  };

  return (
    <li
      className={`flex flex-col rounded-3xl bg-surface p-5 shadow-card ${address.isDefault ? "ring-2 ring-primary/30" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-lg font-semibold text-ink">
          <MdOutlinePlace
            size={20}
            aria-hidden="true"
            className="text-primary"
          />{" "}
          {address.label}
        </p>
        {address.isDefault && (
          <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
            Default
          </span>
        )}
      </div>
      <p className="text-sm leading-6 text-ink-soft">
        <span className="block font-medium text-ink">{address.fullName}</span>
        {address.street}, {address.city}, {address.state}
        <span className="block">{localPhone(address.phone)}</span>
        {address.instructions && (
          <span className="block italic">"{address.instructions}"</span>
        )}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-line pt-3 text-sm font-semibold">
        {confirming ? (
          <>
            <span className="font-normal text-ink-soft">
              Delete this address?
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => update("DELETE", "Address deleted.")}
              className="text-danger hover:underline"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-ink-soft hover:underline"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1 text-primary-hover hover:underline"
            >
              <MdEdit size={16} aria-hidden="true" /> Edit
            </button>
            {!address.isDefault && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  update(
                    "PATCH",
                    `"${address.label}" is now your default address.`,
                  )
                }
                className="text-ink hover:underline"
              >
                Set as default
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={`Delete ${address.label}`}
              className="ml-auto flex items-center gap-1 text-danger hover:underline"
            >
              <MdDeleteOutline size={16} aria-hidden="true" /> Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
};

export default AddressCard;
