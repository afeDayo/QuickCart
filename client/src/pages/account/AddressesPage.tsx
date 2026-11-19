// AddressesPage.tsx client/src/pages/account/AddressesPage.tsx
// My Account → Delivery Addresses: your saved addresses (used at checkout), add, edit, set default, delete.
// The addresses are part of the logged-in user (user.addresses), so no extra loading is needed.

// STEP 39 (part 15): The Delivery Addresses page

import { useState } from "react";
import { MdAdd, MdOutlineWrongLocation } from "react-icons/md";
import AddressCard from "../../components/account/AddressCard";
import AddressForm from "../../components/account/AddressForm";
import EmptyState from "../../components/common/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const AddressesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  // null = just the list; "new" = the add form; an id = editing that address
  const [editing, setEditing] = useState<string | null>(null);
  if (!user) return null;

  const done = (message: string) => {
    setEditing(null);
    showToast({ type: "success", title: message });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-surface p-6 shadow-card">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Delivery Addresses
          </h1>
          <p className="mt-1 text-ink-soft">
            Your default address is chosen automatically at checkout.
          </p>
        </div>
        {editing === null && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white hover:bg-primary-hover"
          >
            <MdAdd size={20} aria-hidden="true" /> Add New Address
          </button>
        )}
      </div>

      {editing !== null ? (
        <AddressForm
          // key: switching from one address to another starts the form fresh with that address
          key={editing}
          address={user.addresses.find((address) => address._id === editing)}
          onDone={done}
          onCancel={() => setEditing(null)}
        />
      ) : user.addresses.length === 0 ? (
        <EmptyState
          icon={MdOutlineWrongLocation}
          title="No saved addresses yet"
          text="Add one now to check out in seconds next time."
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 max-md:grid-cols-1">
          {user.addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              onEdit={() => setEditing(address._id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressesPage;
