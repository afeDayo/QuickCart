// ResetPasswordPage.tsx client/src/pages/auth/ResetPasswordPage.tsx
// /reset-password/<token>: the link from the email. It first asks the server if the link is still good
// (GET /api/auth/reset-password/:token), then lets you choose a new password (POST, server STEP 19).
// 3 states: the form, "Link Expired or Invalid", and success. (Design: Reset Password & Email Verification)

// STEP 37 (part 4): Reset password

import { useState, type FormEvent } from "react";
import {
  MdArrowBack,
  MdArrowForward,
  MdCheckCircle,
  MdDoneAll,
  MdKey,
  MdLockReset,
  MdOutlineMail,
  MdWarningAmber,
} from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import AccountRecoveryLayout from "../../components/auth/AccountRecoveryLayout";
import PasswordInput from "../../components/form/PasswordInput";
import PasswordStrength from "../../components/form/PasswordStrength";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import type { AuthResponse } from "../../types/api";
import { api } from "../../utils/api";
import { isPasswordValid } from "../../utils/password";

const ResetPasswordPage = () => {
  const { token = "" } = useParams();
  const { startSession } = useAuth();

  // Is the link still good? (Expired, already used, or made up -> 400 with the server's message)
  const check = useApi<{ valid: boolean }>(`/auth/reset-password/${token}`);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPasswordValid(password))
      return setError(
        "Your password needs at least 8 characters, an uppercase letter and a number.",
      );
    if (password !== confirm) return setError("Passwords do not match.");

    setError("");
    setSaving(true);
    try {
      // The server sends a fresh login token back: you're logged in straight away (and every OTHER device is logged out)
      const reply = await api<AuthResponse>(`/auth/reset-password/${token}`, {
        method: "POST",
        body: { password, confirmPassword: confirm },
      });
      startSession(reply);
      setDone(true);
    } catch (err) {
      setError((err as Error).message); // e.g. "Your new password must be different from your old password."
      setSaving(false);
    }
  };

  const layoutProps = {
    title: "Account Recovery & Access.",
    text: "Choose a strong new password. Changing it immediately logs you out of every other device.",
  };

  if (check.loading) {
    return (
      <AccountRecoveryLayout {...layoutProps}>
        <div
          role="status"
          className="flex min-h-80 items-center justify-center"
        >
          <span className="size-8 animate-spin rounded-full border-3 border-primary-light border-t-primary" />
          <span className="sr-only">Checking your link...</span>
        </div>
      </AccountRecoveryLayout>
    );
  }

  // Bad link: the "Link Expired or Invalid" box from the design
  if (check.error && !done) {
    return (
      <AccountRecoveryLayout {...layoutProps}>
        <div className="rounded-2xl bg-danger-light p-6">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-danger text-white">
              <MdWarningAmber size={24} aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-ink">
                Link Expired or Invalid
              </h1>
              <p className="mt-2 text-ink-soft">{check.error}</p>
              <Link
                to="/forgot-password"
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-5 font-semibold text-white hover:bg-footer"
              >
                <MdOutlineMail size={18} aria-hidden="true" /> Request New Link
              </Link>
            </div>
          </div>
        </div>
      </AccountRecoveryLayout>
    );
  }

  if (done) {
    return (
      <AccountRecoveryLayout {...layoutProps}>
        <div className="text-center">
          <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-mint/40 text-forest">
            <MdCheckCircle size={36} aria-hidden="true" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Password reset!
          </h1>
          <p className="mx-auto mt-3 max-w-100 text-ink-soft">
            You're logged in with your new password. Any other device was logged
            out.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover"
            >
              Continue Shopping <MdArrowForward size={18} aria-hidden="true" />
            </Link>
            <Link
              to="/account"
              className="flex h-12 items-center rounded-xl bg-primary-light px-6 font-semibold text-ink hover:bg-info-light"
            >
              My Account
            </Link>
          </div>
        </div>
      </AccountRecoveryLayout>
    );
  }

  return (
    <AccountRecoveryLayout {...layoutProps}>
      <div className="mb-6 flex items-center justify-between">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary-light text-primary">
          <MdKey size={24} aria-hidden="true" />
        </span>
        <span className="rounded-full bg-field px-3 py-1 text-xs font-bold tracking-wide text-ink-soft">
          STEP 2 OF 2
        </span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        Create a new password
      </h1>
      <p className="mt-2 text-ink-soft">
        Your new password must be different from your previous password.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 flex flex-col gap-5"
      >
        <div className="flex flex-col gap-3">
          <PasswordInput
            label="New Password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordStrength password={password} />
        </div>
        <PasswordInput
          label="Confirm New Password"
          autoComplete="new-password"
          icon={MdLockReset}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          labelAction={
            confirm &&
            confirm === password && (
              <span className="flex items-center gap-1 rounded-full bg-mint/40 px-2 py-0.5 text-xs font-semibold text-forest">
                <MdDoneAll size={14} aria-hidden="true" /> Passwords match
              </span>
            )
          }
        />
        <button
          type="submit"
          disabled={saving}
          className="flex h-13 items-center justify-center gap-2 rounded-xl bg-primary text-lg font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? "Saving..." : "Reset Password"}{" "}
          <MdArrowForward size={20} aria-hidden="true" />
        </button>
      </form>

      <Link
        to="/login"
        className="mx-auto mt-6 flex w-fit items-center gap-1.5 font-medium text-ink hover:text-primary"
      >
        <MdArrowBack size={18} aria-hidden="true" /> Back to Login
      </Link>
    </AccountRecoveryLayout>
  );
};

export default ResetPasswordPage;
