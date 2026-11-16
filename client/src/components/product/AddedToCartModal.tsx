// AddedToCartModal.tsx client/src/components/product/AddedToCartModal.tsx
// The "Added to Cart!" box that drops down under the Navbar's bag (design: Added to cart).
// It opens by itself whenever something is added (cart.lastAdded), from any page. MainLayout shows it.

// STEP 32 (part 9): The "Added to Cart!" pop-up

import { useEffect } from "react";
import {
  MdArrowForward,
  MdCheckCircle,
  MdClose,
  MdOutlineLocalShipping,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { naira, plural } from "../../utils/format";

const AddedToCartModal = () => {
  const { lastAdded, dismissLastAdded, count, subtotal } = useCart();

  // Close by itself after 6 seconds, or when Escape is pressed. Adding again restarts the timer
  // (lastAdded changes, so the effect runs again and the old timer is cleared).
  useEffect(() => {
    if (!lastAdded) return;
    const timer = setTimeout(dismissLastAdded, 6000);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissLastAdded();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [lastAdded, dismissLastAdded]);

  if (!lastAdded) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="added-title"
      className="fixed top-22 right-4 left-4 z-60 animate-pop-in rounded-3xl bg-surface p-5 shadow-banner sm:left-auto sm:w-120 md:right-12"
    >
      <div className="flex items-start justify-between border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <MdCheckCircle
            size={30}
            aria-hidden="true"
            className="text-success"
          />
          <div>
            <h2
              id="added-title"
              className="text-lg leading-6 font-bold text-ink"
            >
              Added to Cart!
            </h2>
            <p className="text-xs font-semibold text-muted">
              ({plural(lastAdded.quantity, "item")} added)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismissLastAdded}
          aria-label="Close"
          className="text-ink-soft hover:text-ink"
        >
          <MdClose size={22} />
        </button>
      </div>

      <div className="flex items-center gap-4 py-4">
        <img
          src={lastAdded.image}
          alt=""
          className="size-18 shrink-0 rounded-xl bg-field object-cover"
        />
        <div className="min-w-0 flex-1 text-sm">
          <p className="truncate font-medium text-ink">{lastAdded.name}</p>
          {lastAdded.color && (
            <p className="text-ink-soft">Color: {lastAdded.color}</p>
          )}
          <div className="mt-1 flex items-center justify-between">
            <p className="text-ink-soft">Qty: {lastAdded.quantity}</p>
            <p className="text-lg font-bold text-primary-hover">
              {naira(lastAdded.price * lastAdded.quantity)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-2xl bg-panel p-4">
        <p className="flex items-center justify-between text-sm text-ink-soft">
          Cart Subtotal ({plural(count, "item")}):
          <span className="text-lg font-bold text-ink">{naira(subtotal)}</span>
        </p>
        {/* Standard delivery is always free in our server (DELIVERY_OPTIONS, server STEP 22) */}
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-success">
          <MdOutlineLocalShipping size={16} aria-hidden="true" />
          Eligible for Free Standard Delivery in Nigeria
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          to="/cart"
          onClick={dismissLastAdded}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          View Cart &amp; Checkout{" "}
          <MdArrowForward size={18} aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={dismissLastAdded}
          className="h-11 rounded-xl bg-panel text-sm font-semibold text-ink transition-colors hover:bg-field"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default AddedToCartModal;
