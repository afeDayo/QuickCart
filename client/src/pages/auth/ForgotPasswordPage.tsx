// ForgotPasswordPage.tsx client/src/pages/auth/ForgotPasswordPage.tsx
// "Forgot your password?": enter your email, get a reset link by email (POST /api/auth/forgot-password, server
// STEP 19). Then "Check your inbox". (Design: Forgot Password & Confirmation)

// STEP 37 (part 3): Forgot password

import { useState, type FormEvent } from "react";
import {
  MdArrowBack,
  MdInfoOutline,
  MdKey,
  MdMarkEmailRead,
  MdOutlineMail,
  MdScience,
} from "react-icons/md";
import { Link } from "react-router-dom";
import AccountRecoveryLayout from "../../components/auth/AccountRecoveryLayout";
import TextInput from "../../components/form/TextInput";
import { api } from "../../utils/api";

const EMAIL_RULE = /^\S+@\S+\.\S+$/;

type ForgotReply = { message: string; devResetUrl?: string };

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<ForgotReply | null>(null); // the server's answer = the "sent" screen

  const send = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!EMAIL_RULE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSending(true);
    try {
      setSent(
        await api<ForgotReply>("/auth/forgot-password", {
          method: "POST",
          body: { email: email.trim() },
        }),
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  // The link in the email points at the website: http://localhost:5173/reset-password/<token>.
  // In demo mode the server also sends it back (devResetUrl), so we can open it without an inbox.
  const demoLink = sent?.devResetUrl
    ? new URL(sent.devResetUrl).pathname
    : null;

  return (
    <AccountRecoveryLayout
      title="Effortless Account Recovery."
      text="We value your data integrity. All password recovery links are single-use and expire automatically after fifteen minutes."
    >
      {sent ? (
        <div className="text-center">
          <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-mint/40 text-forest">
            <MdMarkEmailRead size={32} aria-hidden="true" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Check your inbox
          </h1>
          {/* The server says the same thing whether the account exists or not, so strangers can't find out */}
          <p className="mx-auto mt-3 max-w-110 text-base leading-7 text-ink-soft">
            {sent.message} The link works once, for 15 minutes. Check your spam
            folder if it's not there in a minute.
          </p>

          {demoLink && (
            <div className="mt-6 rounded-2xl border border-dashed border-primary/40 bg-primary-light/40 p-4 text-left text-sm">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <MdScience
                  size={18}
                  aria-hidden="true"
                  className="text-primary"
                />{" "}
                Demo mode
              </p>
              <p className="mt-1 text-ink-soft">
                No inbox needed: this is the link that was emailed.
              </p>
              <Link
                to={demoLink}
                className="mt-2 inline-block font-semibold text-primary-hover hover:underline"
              >
                Open the reset link →
              </Link>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => send()}
              disabled={sending}
              className="font-semibold text-primary-hover hover:underline disabled:opacity-60"
            >
              {sending ? "Sending..." : "Didn't get it? Send again"}
            </button>
            <button
              type="button"
              onClick={() => setSent(null)}
              className="text-sm text-muted hover:text-ink"
            >
              Use a different email
            </button>
            <Link
              to="/login"
              className="mt-2 flex items-center gap-1.5 font-medium text-ink hover:text-primary"
            >
              <MdArrowBack size={18} aria-hidden="true" /> Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-5 flex w-fit items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-sm font-semibold text-ink">
            <MdKey size={16} aria-hidden="true" className="text-primary" />{" "}
            Credential Assistance
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Forgot your password?
          </h1>
          <p className="mt-3 text-base leading-7 text-ink-soft">
            No worries! Enter your registered email address and we'll send you a
            secure link to reset your password.
          </p>

          <form onSubmit={send} noValidate className="mt-8 flex flex-col gap-6">
            <TextInput
              label="Registered Email Address"
              type="email"
              autoComplete="email"
              icon={MdOutlineMail}
              placeholder="ada.obi@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              error={error}
            />
            <button
              type="submit"
              disabled={sending}
              className="h-13 rounded-xl bg-primary-hover text-lg font-semibold text-white transition-colors hover:bg-primary disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <Link
            to="/login"
            className="mx-auto mt-6 flex w-fit items-center gap-1.5 font-medium text-ink hover:text-primary"
          >
            <MdArrowBack size={18} aria-hidden="true" /> Back to Login
          </Link>

          <p className="mt-8 flex gap-3 rounded-2xl bg-panel p-4 text-sm leading-6 text-ink-soft">
            <MdInfoOutline
              size={20}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />
            Quick tip: remembered it? Just go back and log in. Your cart is
            saved on this device either way.
          </p>
        </>
      )}
    </AccountRecoveryLayout>
  );
};

export default ForgotPasswordPage;
