// CancelOrderPanel.tsx client/src/components/order/CancelOrderPanel.tsx
// "Cancel Order · Free cancellation available within 1 hour of placement (46 mins remaining)".
// Shown only while the server says the order can be cancelled (canCancel: still processing, less than 1 hour old).
// PATCH /api/orders/:orderNumber/cancel (server STEP 22) refunds a card and puts the stock back.

// STEP 40 (part 8): Cancel an order

import { useEffect, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { useToast } from "../../context/ToastContext";
import { api } from "../../utils/api";

type CancelOrderPanelProps = {
  orderNumber: string;
  deadline: string; // when free cancellation ends (server STEP 22: placed + 1 hour)
  onCancelled: () => void;
};

const minutesLeft = (deadline: string) =>
  Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 60_000));

const CancelOrderPanel = ({
  orderNumber,
  deadline,
  onCancelled,
}: CancelOrderPanelProps) => {
  const { showToast } = useToast();
  const [minutes, setMinutes] = useState(() => minutesLeft(deadline));
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  // Update "46 mins remaining" every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setMinutes(minutesLeft(deadline)), 30_000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (minutes <= 0) return null; // the hour is over: the server would refuse anyway

  const cancel = async () => {
    setBusy(true);
    try {
      await api(`/orders/${orderNumber}/cancel`, {
        method: "PATCH",
        body: { reason: reason.trim() || undefined },
      });
      showToast({
        type: "success",
        title: "Your order has been cancelled.",
        message: "If you paid by card, the refund is on its way.",
      });
      onCancelled(); // the page reloads the order: the tracker turns into "Order cancelled"
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't cancel the order",
        message: (err as Error).message,
      });
      setBusy(false);
    }
  };

  return (
    <div className="text-center">
      {confirming ? (
        <div className="rounded-2xl bg-danger-light p-4 text-left">
          <p className="font-semibold text-ink">Cancel order #{orderNumber}?</p>
          <label
            htmlFor="cancel-reason"
            className="mt-3 block text-sm text-ink-soft"
          >
            Why? (optional)
          </label>
          <input
            id="cancel-reason"
            value={reason}
            maxLength={200}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Ordered the wrong colour"
            className="mt-1 h-11 w-full rounded-xl bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-danger/30"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="h-10 flex-1 rounded-xl bg-danger font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Cancelling..." : "Yes, cancel it"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-10 flex-1 rounded-xl bg-surface font-semibold text-ink"
            >
              Keep my order
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-1.5 font-semibold text-danger hover:underline"
        >
          <MdOutlineCancel size={18} aria-hidden="true" /> Cancel Order
        </button>
      )}
      <p className="mt-2 text-sm text-ink-soft">
        Free cancellation available within 1 hour of placement ({minutes}{" "}
        {minutes === 1 ? "min" : "mins"} remaining)
      </p>
    </div>
  );
};

export default CancelOrderPanel;
