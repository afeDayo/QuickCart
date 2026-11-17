// CheckOUTSummary.tsx client/src/components/checkout/CheckOUTSummary.tsx
// The Order Summary on the right of the checkout: what you're buying, the promo code, the totals, PLACE ORDER NOW.
// (The file name has odd capitals because that's how the placeholder was made; the import uses the same spelling.)

// STEP 38 (part 9): The checkout summary

import {
  MdArrowBack,
  MdArrowForward,
  MdOutlineLocalOffer,
  MdOutlineVerifiedUser,
} from "react-icons/md";
import { Link } from "react-router-dom";
import type { CartItem } from "../../context/CartContext";
import { naira, plural } from "../../utils/format";

type CheckoutSummaryProps = {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  deliveryLabel: string;
  promo: { code: string; discount: number } | null;
  error: string; // the server's answer if placing the order failed (e.g. "Your card was declined...")
  placing: boolean;
  onPlace: () => void;
};

const CheckOUTSummary = ({
  items,
  subtotal,
  deliveryFee,
  deliveryLabel,
  promo,
  error,
  placing,
  onPlace,
}: CheckoutSummaryProps) => {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = subtotal - (promo?.discount ?? 0) + deliveryFee;

  return (
    <aside
      aria-labelledby="checkout-summary-title"
      className="rounded-3xl bg-surface p-6 shadow-card lg:sticky lg:top-28"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="checkout-summary-title"
          className="flex items-center gap-2 text-xl font-semibold text-ink"
        >
          Order Summary{" "}
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
            {plural(count, "Item")}
          </span>
        </h2>
        <Link
          to="/cart"
          className="text-sm font-semibold text-primary-hover hover:underline"
        >
          Edit Bag
        </Link>
      </div>

      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-3">
            <span className="relative shrink-0">
              <img
                src={item.image}
                alt=""
                className="size-14 rounded-xl bg-field object-cover"
              />
              <span className="absolute -right-1 -bottom-1 rounded-md bg-ink px-1.5 text-[11px] font-bold text-white">
                x{item.quantity}
              </span>
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block truncate font-semibold text-ink">
                {item.name}
              </span>
              {item.color && (
                <span className="text-ink-soft">{item.color}</span>
              )}
            </span>
            <span className="text-right font-bold text-ink">
              {naira(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {promo && (
        <p className="mt-4 flex items-center justify-between rounded-xl bg-primary-light/50 px-3 py-2 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-primary">
            <MdOutlineLocalOffer size={16} aria-hidden="true" /> {promo.code}{" "}
            Applied
          </span>
          <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-bold text-danger">
            Save {naira(promo.discount)}
          </span>
        </p>
      )}

      <dl className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Subtotal</dt>
          <dd className="font-semibold text-ink">{naira(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">Delivery ({deliveryLabel})</dt>
          <dd
            className={`font-semibold ${deliveryFee === 0 ? "text-success" : "text-ink"}`}
          >
            {deliveryFee === 0 ? "Free" : naira(deliveryFee)}
          </dd>
        </div>
        {promo && (
          <div className="flex justify-between">
            <dt className="text-ink-soft">Discount ({promo.code})</dt>
            <dd className="font-semibold text-success">
              −{naira(promo.discount)}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex items-end justify-between rounded-2xl bg-panel p-4">
        <p>
          <span className="block text-lg font-semibold text-ink">
            Total Due
          </span>
          <span className="text-xs text-muted">
            Includes VAT &amp; delivery
          </span>
        </p>
        <p className="text-3xl font-bold text-primary-hover">{naira(total)}</p>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onPlace}
        disabled={placing}
        className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold tracking-wide text-white uppercase transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {placing ? "Placing your order..." : "Place Order Now"}{" "}
        <MdArrowForward size={20} aria-hidden="true" />
      </button>

      <p className="mt-3 rounded-xl bg-panel px-4 py-2.5 text-center text-xs text-ink-soft">
        The server checks every price, the stock and your promo code again
        before charging.
      </p>

      <Link
        to="/cart"
        className="mx-auto mt-4 flex w-fit items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <MdArrowBack size={16} aria-hidden="true" /> Return to Cart
      </Link>

      <p className="mt-5 flex items-center justify-center gap-2 border-t border-line pt-4 text-xs font-semibold text-ink-soft">
        <MdOutlineVerifiedUser
          size={16}
          aria-hidden="true"
          className="text-success"
        />{" "}
        100% Buyer Protection Guarantee
      </p>
    </aside>
  );
};

export default CheckOUTSummary;
