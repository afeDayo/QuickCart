// VerifyEmailPage.tsx client/src/pages/auth/VerifyEmailPage.tsx
// "Verify your email": send a 6-digit code by email (POST /api/auth/send-verification), then type it
// (POST /api/auth/verify-email, server STEP 19). New accounts land here after registering.
// It's inside ProtectedRoute (App.tsx), so only logged-in users get here.

// STEP 37 (part 5): Verify email

import { useEffect, useState, type FormEvent } from "react";
import {
  MdArrowForward,
  MdMarkEmailUnread,
  MdScience,
  MdVerified,
} from "react-icons/md";
import { Link } from "react-router-dom";
import AccountRecoveryLayout from "../../components/auth/AccountRecoveryLayout";
import CodeInput from "../../components/form/CodeInput";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types/api";
import { api } from "../../utils/api";

const RESEND_SECONDS = 60; // wait a minute before "Send again", so nobody floods the inbox

const VerifyEmailPage = () => {
  const { user, setUser } = useAuth();
  const [sentTo, setSentTo] = useState(""); // the message after sending: "We've sent a 6-digit code to ..."
  const [devCode, setDevCode] = useState(""); // demo mode only: the code, so a demo needs no inbox
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0); // seconds before you can send again

  // Count the resend timer down, one second at a time
  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const sendCode = async () => {
    setError("");
    setBusy(true);
    try {
      const reply = await api<{ message: string; devCode?: string }>(
        "/auth/send-verification",
        { method: "POST" },
      );
      setSentTo(reply.message);
      setDevCode(reply.devCode ?? "");
      setCode("");
      setWait(RESEND_SECONDS);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length !== 6) return setError("Please type all 6 digits.");
    setError("");
    setBusy(true);
    try {
      const reply = await api<{ message: string; user: User }>(
        "/auth/verify-email",
        { method: "POST", body: { code } },
      );
      setUser(reply.user); // isEmailVerified is now true everywhere (the Account page shows "Verified", STEP 39)
    } catch (err) {
      setError((err as Error).message); // "That code is wrong or has expired. Please request a new one."
    } finally {
      setBusy(false);
    }
  };

  const layoutProps = {
    title: "Confirm it's really you.",
    text: "A verified email lets us send your order updates and keeps your account recoverable if you forget your password.",
  };

  // Verified (just now, or already): the success screen
  if (user?.isEmailVerified) {
    return (
      <AccountRecoveryLayout {...layoutProps}>
        <div className="text-center">
          <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-mint/40 text-forest">
            <MdVerified size={36} aria-hidden="true" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Your email is verified
          </h1>
          <p className="mx-auto mt-3 max-w-100 text-ink-soft">
            Order updates for <strong className="text-ink">{user.email}</strong>{" "}
            will arrive in that inbox.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover"
          >
            Start Shopping <MdArrowForward size={18} aria-hidden="true" />
          </Link>
        </div>
      </AccountRecoveryLayout>
    );
  }

  return (
    <AccountRecoveryLayout {...layoutProps}>
      <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <MdMarkEmailUnread size={28} aria-hidden="true" />
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        Verify your email
      </h1>
      <p className="mt-2 text-ink-soft">
        {sentTo || (
          <>
            We'll send a 6-digit code to{" "}
            <strong className="text-ink">{user?.email}</strong>. It works for 15
            minutes.
          </>
        )}
      </p>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {!sentTo ? (
        <button
          type="button"
          onClick={sendCode}
          disabled={busy}
          className="mt-8 h-13 w-full rounded-xl bg-primary text-lg font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? "Sending..." : "Send me a code"}
        </button>
      ) : (
        <form onSubmit={verify} noValidate className="mt-8 flex flex-col gap-6">
          <CodeInput
            value={code}
            onChange={(value) => {
              setCode(value);
              setError("");
            }}
            invalid={Boolean(error)}
          />

          {devCode && (
            <p className="flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary-light/40 px-4 py-3 text-sm text-ink-soft">
              <MdScience
                size={18}
                aria-hidden="true"
                className="shrink-0 text-primary"
              />
              Demo mode: the emailed code is{" "}
              <strong className="font-mono text-ink">{devCode}</strong>
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="h-13 rounded-xl bg-primary text-lg font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {busy ? "Checking..." : "Verify Email"}
          </button>
          <button
            type="button"
            onClick={sendCode}
            disabled={busy || wait > 0}
            className="text-sm font-semibold text-primary-hover hover:underline disabled:text-muted disabled:no-underline"
          >
            {wait > 0 ? `Send a new code in ${wait}s` : "Send a new code"}
          </button>
        </form>
      )}

      <Link
        to="/"
        className="mx-auto mt-6 block w-fit text-sm text-muted hover:text-ink"
      >
        Skip for now
      </Link>
    </AccountRecoveryLayout>
  );
};

export default VerifyEmailPage;
