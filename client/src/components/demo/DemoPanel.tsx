// DemoPanel.tsx client/src/components/demo/DemoPanel.tsx
// The demo tools on the admin Settings page, for presenting the project:
//   "Move orders along": every processing order -> shipped, every shipped order -> delivered (no emails)
//   "Reset demo data":   everything back to the seed (like npm run seed), then log in again
// POST /api/admin/demo/advance-orders and /api/admin/demo/reset (server STEP 28).
// They only exist while the server's demo mode is on (on with npm run dev; OFF online, see STEP 45).

// STEP 45 (part 1): The demo panel

import { useState } from "react";
import { MdFastForward, MdRestartAlt, MdScience } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { announceCountsChanged } from "../../utils/adminEvents";
import { api, ApiError } from "../../utils/api";

const DemoPanel = () => {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [confirmText, setConfirmText] = useState(""); // the admin types RESET to unlock the button
  const [off, setOff] = useState(false); // the server answered 404: demo mode is off there

  // 404 = the routes don't exist because demo mode is off (server/src/routes/adminRoutes.ts)
  const handleError = (err: unknown, title: string) => {
    if (err instanceof ApiError && err.status === 404) {
      setOff(true);
    } else {
      showToast({ type: "error", title, message: (err as Error).message });
    }
  };

  const advance = async () => {
    setBusy(true);
    try {
      const { message } = await api<{ message: string }>(
        "/admin/demo/advance-orders",
        { method: "POST" },
      );
      showToast({ type: "success", title: message });
      announceCountsChanged(); // the menu's "4 New"
    } catch (err) {
      handleError(err, "Couldn't move the orders");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    try {
      const { message } = await api<{ message: string }>("/admin/demo/reset", {
        method: "POST",
        body: { confirm: "RESET" },
      });
      // Every account was made again with a new id, so this login no longer works: log out and sign in again
      logout();
      showToast({ type: "success", title: message });
      navigate("/admin/login");
    } catch (err) {
      handleError(err, "Couldn't reset the demo data");
      setBusy(false);
    }
  };

  return (
    <section
      aria-labelledby="demo-title"
      className="rounded-3xl bg-surface p-6 shadow-card"
    >
      <h2
        id="demo-title"
        className="flex items-center gap-2 text-xl font-semibold text-ink"
      >
        <MdScience size={22} aria-hidden="true" className="text-primary" /> Demo
        tools
      </h2>

      {off ? (
        <p
          role="status"
          className="mt-3 rounded-2xl bg-panel p-4 text-sm text-ink-soft"
        >
          The demo tools are turned off on this server. That's on purpose for
          the online shop: demo mode also shows password reset links on screen,
          which anyone could use. Run the server with <code>npm run dev</code>{" "}
          on your computer to use them.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-110 text-sm text-ink-soft">
              <strong className="font-semibold text-ink">
                Move orders along:
              </strong>{" "}
              every Processing order becomes Shipped and every Shipped order
              becomes Delivered, so the trackers move during a presentation. No
              emails are sent.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={advance}
              className="flex h-11 items-center gap-2 rounded-xl bg-primary-hover px-4 font-semibold text-white hover:bg-primary disabled:opacity-60"
            >
              <MdFastForward size={20} aria-hidden="true" /> Move orders along
            </button>
          </div>

          <div className="rounded-2xl bg-danger-light p-4">
            <p className="text-sm text-danger">
              <strong className="font-semibold">Reset demo data:</strong>{" "}
              deletes every change (products, orders, accounts, reviews,
              uploaded photos) and puts the demo data back, like{" "}
              <code>npm run seed</code>. Newsletter subscribers are kept. You'll
              need to log in again.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label htmlFor="reset-confirm" className="sr-only">
                Type RESET to confirm
              </label>
              <input
                id="reset-confirm"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="Type RESET"
                className="h-11 w-36 rounded-xl bg-surface px-3 outline-none focus:ring-2 focus:ring-danger/30"
              />
              <button
                type="button"
                disabled={busy || confirmText !== "RESET"}
                onClick={reset}
                className="flex h-11 items-center gap-2 rounded-xl bg-danger px-4 font-semibold text-white disabled:opacity-50"
              >
                <MdRestartAlt size={20} aria-hidden="true" /> Reset demo data
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DemoPanel;
