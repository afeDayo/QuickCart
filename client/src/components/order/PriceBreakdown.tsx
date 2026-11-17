// PriceBreakdown.tsx client/src/components/order/PriceBreakdown.tsx
// "Payment Breakdown": subtotal, delivery, discount and the total of an order, exactly as the SERVER worked them out.
// Used on the Order Confirmation page, and Order Details in STEP 40.

// STEP 38 (part 12): The price breakdown

import type { Order } from "../../types/api";
import { naira, plural } from "../../utils/format";

const PriceBreakdown = ({ order }: { order: Order }) => {
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const paidLabel =
    order.payment.status === "paid"
      ? "Total Paid"
      : order.payment.status === "refunded"
        ? "Total (refunded)"
        : "Total to pay on delivery";

  return (
    <section
      aria-labelledby="breakdown-title"
      className="rounded-3xl bg-surface p-6 shadow-card"
    >
      <h2 id="breakdown-title" className="mb-4 text-xl font-semibold text-ink">
        Payment Breakdown
      </h2>
      <dl className="flex flex-col gap-3 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Subtotal ({plural(count, "item")})</dt>
          <dd className="text-ink">{naira(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="flex items-center gap-2 text-ink-soft">
            Delivery
            <span className="rounded-full bg-mint/40 px-2 py-0.5 text-xs font-semibold text-forest capitalize">
              {order.deliveryMethod}
            </span>
          </dt>
          <dd
            className={
              order.deliveryFee === 0
                ? "font-semibold text-success"
                : "text-ink"
            }
          >
            {order.deliveryFee === 0 ? "FREE" : naira(order.deliveryFee)}
          </dd>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <dt className="flex items-center gap-2 text-ink-soft">
              Discount{" "}
              <span className="rounded-md bg-primary-light px-1.5 py-0.5 font-mono text-xs font-bold text-primary">
                {order.promoCode}
              </span>
            </dt>
            <dd className="font-semibold text-danger">
              −{naira(order.discount)}
            </dd>
          </div>
        )}
      </dl>
      <div className="mt-5 flex items-end justify-between rounded-2xl bg-panel p-5">
        <p>
          <span className="block text-lg font-semibold text-ink">
            {paidLabel}
          </span>
          <span className="text-xs text-muted">
            Includes VAT &amp; all delivery fees
          </span>
        </p>
        <p className="text-3xl font-bold text-primary-hover">
          {naira(order.total)}
        </p>
      </div>
    </section>
  );
};

export default PriceBreakdown;
