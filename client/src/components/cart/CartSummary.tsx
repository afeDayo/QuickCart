// CartSummary.tsx client/src/components/cart/CartSummary.tsx
// "Order Summary": subtotal, delivery, discount, the promo box, the total and "Proceed to Checkout".

// STEP 36 (part 6): The order summary

import type { ReactNode } from "react";
import { MdLockOutline, MdOutlineVerifiedUser } from "react-icons/md";
import { Link } from "react-router-dom";
import { naira, plural } from "../../utils/format";

type CartSummaryProps = {
  units: number;
  subtotal: number;
  discount: number;
  promoCode?: string;
  promoForm: ReactNode; // the promo box, given by the page (it owns the promo state)
};

const CartSummary = ({
  units,
  subtotal,
  discount,
  promoCode,
  promoForm,
}: CartSummaryProps) => {
  const total = subtotal - discount;

  return (
    <aside
      aria-labelledby="summary-title"
      className="rounded-3xl bg-surface p-6 shadow-card lg:sticky lg:top-28"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 id="summary-title" className="text-2xl font-semibold text-ink">
          Order Summary
        </h2>
        <span className="rounded-full bg-field px-3 py-1 text-xs font-semibold text-ink-soft">
          {plural(units, "Unit")}
        </span>
      </div>

      <dl className="flex flex-col gap-3 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Items Subtotal</dt>
          <dd className="font-semibold text-ink">{naira(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">
            Estimated Delivery
            <span className="block text-xs text-success">
              Standard delivery is free (Express ₦2,500 at checkout)
            </span>
          </dt>
          <dd className="font-semibold text-success">FREE</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-ink-soft">Discount ({promoCode})</dt>
            <dd className="font-semibold text-success">−{naira(discount)}</dd>
          </div>
        )}
      </dl>

      <div className="my-5">{promoForm}</div>

      <div className="flex items-end justify-between rounded-2xl bg-panel p-5">
        <p>
          <span className="block text-lg font-semibold text-ink">Total</span>
          <span className="text-xs text-muted">
            Includes VAT where applicable
          </span>
        </p>
        <p className="text-3xl font-bold text-primary-hover">{naira(total)}</p>
      </div>

      <Link
        to="/checkout"
        className="mt-5 flex h-13 items-center justify-center gap-2 rounded-xl bg-primary text-lg font-semibold text-white shadow-[0_4px_12px_rgba(50,43,208,0.25)] transition-colors hover:bg-primary-hover"
      >
        <MdLockOutline size={20} aria-hidden="true" /> Proceed to Checkout
      </Link>

      <div className="mt-5 flex gap-3 rounded-2xl bg-panel p-4">
        <MdOutlineVerifiedUser
          size={22}
          aria-hidden="true"
          className="shrink-0 text-success"
        />
        <p className="text-sm text-ink-soft">
          <span className="block font-semibold text-ink">
            QuickCart Buyer Protection
          </span>
          Full refund if the item is not as described or delayed past the
          promised date.
        </p>
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
        Accepted:
        {["Visa", "Mastercard", "Verve", "Pay on Delivery"].map((method) => (
          <span
            key={method}
            className="rounded-md bg-field px-2 py-1 font-semibold text-ink-soft uppercase"
          >
            {method}
          </span>
        ))}
      </p>
    </aside>
  );
};

export default CartSummary;
