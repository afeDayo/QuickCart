// ChangePasswordForm.tsx client/src/components/account/ChangePasswordForm.tsx
// "Change Password": current password, new password (with the strength meter), confirm.
// PATCH /api/account/password (server STEP 20) answers with a NEW token: every other device is logged out, and
// this one must save the new token to stay logged in.

// STEP 39 (part 10): Change password

import { useState, type FormEvent } from "react";
import { MdOutlineLockReset } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { AuthResponse } from "../../types/api";
import { api } from "../../utils/api";
import { isPasswordValid } from "../../utils/password";
import PasswordInput from "../form/PasswordInput";
import PasswordStrength from "../form/PasswordStrength";

const empty = { currentPassword: "", newPassword: "", confirmPassword: "" };

const ChangePasswordForm = () => {
  const { startSession } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.currentPassword)
      return setError("Please enter your current password.");
    if (!isPasswordValid(form.newPassword))
      return setError(
        "Your new password needs at least 8 characters, an uppercase letter and a number.",
      );
    if (form.newPassword !== form.confirmPassword)
      return setError("Passwords do not match.");

    setError("");
    setSaving(true);
    try {
      const reply = await api<AuthResponse>("/account/password", {
        method: "PATCH",
        body: form,
      });
      startSession(reply); // save the NEW token (the old one stopped working the moment the password changed)
      setForm(empty);
      showToast({
        type: "success",
        title: "Your password has been changed.",
        message: "Any other device was logged out.",
      });
    } catch (err) {
      setError((err as Error).message); // e.g. "Your current password is incorrect."
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl bg-surface p-6 shadow-card"
    >
      <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold text-ink">
        <MdOutlineLockReset
          size={22}
          aria-hidden="true"
          className="text-primary"
        />{" "}
        Change Password
      </h2>
      <p className="mb-5 text-sm text-ink-soft">
        Changing it logs you out of every other device.
      </p>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4">
        <PasswordInput
          label="Current Password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={(e) =>
            setForm({ ...form, currentPassword: e.target.value })
          }
        />
        <PasswordInput
          label="New Password"
          autoComplete="new-password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        {form.newPassword && <PasswordStrength password={form.newPassword} />}
        <PasswordInput
          label="Confirm New Password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-5 h-11 rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {saving ? "Saving..." : "Update Password"}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
