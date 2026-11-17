// EditProfileForm.tsx client/src/components/account/EditProfileForm.tsx
// "Edit Profile Information": first and last name, email, phone. Saves with PATCH /api/account/profile (server STEP 20).
// Used on the Overview (opens under the profile card) and on Account Settings.

// STEP 39 (part 5): Edit profile

import { useState, type FormEvent } from "react";
import { MdClose, MdOutlineManageAccounts } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { User } from "../../types/api";
import { api } from "../../utils/api";
import { localPhone, toInternational } from "../../utils/nigeria";
import TextInput from "../form/TextInput";

type EditProfileFormProps = { onClose?: () => void }; // no onClose = always open (Account Settings)

const EditProfileForm = ({ onClose }: EditProfileFormProps) => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: localPhone(user?.phone),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim())
      return setError("Please enter your first and last name.");

    setError("");
    setSaving(true);
    try {
      const reply = await api<{ message: string; user: User }>(
        "/account/profile",
        {
          method: "PATCH",
          body: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() ? toInternational(form.phone) : "",
          },
        },
      );
      const emailChanged = reply.user.email !== user?.email;
      setUser(reply.user); // the new name shows everywhere at once (Navbar, menu, this page)
      showToast({
        type: "success",
        title: "Your profile has been updated.",
        // A new email isn't verified yet (server STEP 20 turns "Verified" off): say so
        message: emailChanged
          ? "Please verify your new email address in Account Settings."
          : undefined,
      });
      onClose?.();
    } catch (err) {
      setError((err as Error).message); // e.g. 409 "That email is already in use."
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl bg-panel p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
          <MdOutlineManageAccounts
            size={20}
            aria-hidden="true"
            className="text-primary"
          />{" "}
          Edit Profile Information
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink-soft hover:text-ink"
          >
            <MdClose size={22} />
          </button>
        )}
      </div>

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
          label="First Name"
          autoComplete="given-name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />
        <TextInput
          label="Last Name"
          autoComplete="family-name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />
        <TextInput
          label="Email Address"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextInput
          label="Phone Number"
          type="tel"
          autoComplete="tel-national"
          placeholder="0803 123 4567"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>

      <div className="mt-5 flex justify-end gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl px-5 font-medium text-ink hover:bg-field"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;
