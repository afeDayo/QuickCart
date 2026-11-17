// ProfileCard.tsx client/src/components/account/ProfileCard.tsx
// The big profile card: initials, name, "Verified Customer", "Member since March 2026", name / email / phone,
// and Edit Profile, which opens the edit form right under it.

// STEP 39 (part 6): The profile card

import { useState } from "react";
import { MdEdit, MdVerified } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { localPhone } from "../../utils/nigeria";
import EditProfileForm from "./EditProfileForm";

const ProfileCard = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const details = [
    { label: "Full legal name", value: `${user.firstName} ${user.lastName}` },
    { label: "Email address", value: user.email },
    {
      label: "Phone number",
      value: user.phone ? localPhone(user.phone) : "Not added yet",
    },
  ];

  return (
    <section
      aria-labelledby="profile-title"
      className="rounded-3xl bg-surface p-6 shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {user.firstName[0]}
            {user.lastName[0]}
          </span>
          <div>
            <h2
              id="profile-title"
              className="flex flex-wrap items-center gap-2 text-2xl font-semibold text-ink"
            >
              {user.firstName} {user.lastName}
              {user.isEmailVerified && (
                <span className="flex items-center gap-1 rounded-full bg-mint/40 px-2 py-0.5 text-xs font-semibold text-forest">
                  <MdVerified size={14} aria-hidden="true" /> Verified Customer
                </span>
              )}
            </h2>
            <p className="text-sm text-ink-soft">
              {user.role === "admin" ? "Store Admin" : "Shopper"} · Member since{" "}
              {memberSince}
            </p>
          </div>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-field px-4 text-sm font-semibold text-ink hover:bg-primary-light"
          >
            <MdEdit size={16} aria-hidden="true" /> Edit Profile
          </button>
        )}
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        {details.map((detail) => (
          <div key={detail.label} className="rounded-xl bg-panel px-4 py-3">
            <dt className="text-xs font-bold tracking-wider text-ink-soft uppercase">
              {detail.label}
            </dt>
            <dd className="mt-1 truncate text-[15px] font-medium text-ink">
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>

      {editing && (
        <div className="mt-5">
          <EditProfileForm onClose={() => setEditing(false)} />
        </div>
      )}
    </section>
  );
};

export default ProfileCard;
