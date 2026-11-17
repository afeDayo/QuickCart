// PaymentInfo.tsx client/src/components/order/PaymentInfo.tsx
// "Payment Record": the card brand and last 4 digits (all the server ever keeps, STEP 22), the reference and when it
// was paid, or Pay on Delivery, with the payment status.

// STEP 40 (part 7): The payment record

import { MdOutlineCreditCard } from "react-icons/md";
import type { Order } from "../../types/api";
import { shortDateTime } from "../../utils/dates";

const STATUS = {
  paid: { label: "Paid & Confirmed", classes: "bg-mint/40 text-forest" },
  pending: { label: "Pay on Delivery", classes: "bg-[#fff4e0] text-[#8a5300]" },
  refunded: { label: "Refunded", classes: "bg-info-light text-primary" },
};

const PaymentInfo = ({ order }: { order: Order }) => {
  const { payment } = order;
  const status = STATUS[payment.status];

  return (
    <section
      aria-labelledby="payment-title"
      className="rounded-3xl bg-surface p-6 shadow-card"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2
          id="payment-title"
          className="flex items-center gap-2 text-xl font-semibold text-ink"
        >
          <MdOutlineCreditCard
            size={22}
            aria-hidden="true"
            className="text-primary"
          />{" "}
          Payment Record
        </h2>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.classes}`}
        >
          {status.label}
        </span>
      </div>
      <div className="rounded-2xl bg-panel p-4 text-sm">
        {payment.method === "card" ? (
          <>
            <p className="flex items-center gap-3">
              <span className="rounded-md bg-navy px-2 py-1 text-xs font-bold text-white uppercase">
                {payment.cardBrand}
              </span>
              <span className="text-base font-semibold text-ink">
                •••• {payment.cardLast4}
              </span>
              <span className="ml-auto text-xs text-ink-soft">
                Simulated card
              </span>
            </p>
            <dl className="mt-3 flex flex-col gap-2">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Transaction Reference:</dt>
                <dd className="font-mono font-semibold text-ink">
                  {payment.reference}
                </dd>
              </div>
              {payment.paidAt && (
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Processed On:</dt>
                  <dd className="text-ink">{shortDateTime(payment.paidAt)}</dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          <p className="text-ink-soft">
            Pay on Delivery: pay the rider by card or cash when your order
            arrives.
            {payment.status === "paid" &&
              payment.paidAt &&
              ` Paid on ${shortDateTime(payment.paidAt)}.`}
          </p>
        )}
      </div>
    </section>
  );
};

export default PaymentInfo;
