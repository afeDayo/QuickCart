// SavedAddressCard.tsx client/src/components/account/SavedAddressCard.tsx
// The small "Delivery Address" card on the Overview: your default address and a link to manage them all.

// STEP 39 (part 8): The default address card

import { MdArrowForward, MdOutlinePlace } from "react-icons/md";
import { Link } from "react-router-dom";
import type { Address } from "../../types/api";
import { localPhone } from "../../utils/nigeria";

const SavedAddressCard = ({
  address,
  total,
}: {
  address?: Address;
  total: number;
}) => {
  return (
    <section
      aria-labelledby="default-address-title"
      className="flex flex-col rounded-3xl bg-surface p-6 shadow-card"
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary-light text-primary">
          <MdOutlinePlace size={22} aria-hidden="true" />
        </span>
        {address && (
          <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
            Default Address
          </span>
        )}
      </div>
      <h2 id="default-address-title" className="text-xl font-semibold text-ink">
        Delivery Address
      </h2>
      {address ? (
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          <span className="block font-semibold text-ink">{address.street}</span>
          {address.city}, {address.state}, {address.country}
          <span className="block">Contact: {localPhone(address.phone)}</span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">
          Add an address to check out faster.
        </p>
      )}
      <Link
        to="/account/addresses"
        className="mt-auto flex items-center gap-1 border-t border-line pt-4 text-sm font-semibold text-primary-hover hover:underline"
      >
        {total > 0 ? `Manage All (${total}) Addresses` : "Add an address"}{" "}
        <MdArrowForward size={16} aria-hidden="true" />
      </Link>
    </section>
  );
};

export default SavedAddressCard;
