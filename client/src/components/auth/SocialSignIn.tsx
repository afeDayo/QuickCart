// SocialSignIn.tsx client/src/components/auth/SocialSignIn.tsx
// "or · Continue with Google" under the Log In and Sign Up forms. It shows Google's own button (Google's script
// draws it, so it looks like the button people know). When someone picks their Google account, Google gives us
// a signed token; googleLogin (AuthProvider) sends it to the server (POST /api/auth/google), which checks it
// with Google and logs them in, or creates their account.
//   <SocialSignIn mode="signin" onSignedIn={() => navigate(from)} />
// No VITE_GOOGLE_CLIENT_ID in client/.env? Then nothing is shown, so the page never breaks.

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import type { AuthResponse } from "../../types/api";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// Load Google's script once for the whole site, however many buttons ask for it
let scriptPromise: Promise<void> | null = null;
const loadGoogleScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null; // allow another try later (e.g. the connection came back)
      script.remove();
      reject(new Error("Google's sign-in script didn't load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
};

type SocialSignInProps = {
  mode: "signin" | "signup"; // the button's words: "Continue with Google" / "Sign up with Google"
  onSignedIn: (reply: AuthResponse) => void; // after a successful Google sign-in (the page moves on)
};

const SocialSignIn = ({ mode, onSignedIn }: SocialSignInProps) => {
  const { googleLogin } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false); // the script couldn't load (offline, blocked...)

  // Google keeps the function it was given when the button was drawn, so it always calls this ref,
  // and the ref always holds the newest version (with the newest onSignedIn).
  const handleCredential = useRef<(response: GoogleCredentialResponse) => void>(() => {});
  useEffect(() => {
    handleCredential.current = async ({ credential }) => {
      setError("");
      setBusy(true);
      try {
        onSignedIn(await googleLogin(credential));
      } catch (err) {
        setError((err as Error).message); // e.g. "Google sign-in didn't work. Please try again."
        setBusy(false);
      }
    };
  });

  // Load Google's script, then draw its button inside our box
  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        const box = buttonRef.current;
        if (cancelled || !box || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => handleCredential.current(response),
          cancel_on_tap_outside: true,
          ux_mode: "popup", // a small Google window: the shopper never leaves QuickCart
        });
        window.google.accounts.id.renderButton(box, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          logo_alignment: "center",
          text: mode === "signup" ? "signup_with" : "continue_with",
          width: Math.min(400, box.offsetWidth || 400), // Google's limit is 400px
        });
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  if (!CLIENT_ID) return null;

  return (
    <div className="mt-6">
      <p className="flex items-center gap-3 text-sm text-muted">
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        or
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </p>

      {unavailable ? (
        <p className="mt-4 rounded-xl bg-field px-4 py-3 text-center text-sm text-ink-soft">
          Google sign-in couldn't load. Check your connection, or use your email and password.
        </p>
      ) : (
        // Google draws its button in here
        <div
          ref={buttonRef}
          aria-busy={busy}
          className={`mt-4 flex min-h-11 w-full justify-center ${busy ? "pointer-events-none opacity-60" : ""}`}
        />
      )}

      {busy && (
        <p role="status" className="mt-3 text-center text-sm text-ink-soft">
          Signing you in with Google...
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default SocialSignIn;
