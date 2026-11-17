// CartPage.tsx client/src/pages/cart/CartPage.tsx
// "Your Shopping Cart": the lines, the summary with the promo code, or the empty cart. (Designs: Cart, Cart empty state)
// The cart itself lives in CartContext (STEP 32); this page shows it and lets you change it.

// STEP 36 (part 8): The Cart page

import { useEffect, useState } from "react";
import {
  MdArrowBack,
  MdOutlineAutorenew,
  MdOutlineLocalShipping,
  MdOutlineRemoveShoppingCart,
  MdOutlineVerified,
} from "react-icons/md";
import { Link } from "react-router-dom";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import EmptyCart from "../../components/cart/EmptyCart";
import FreeDeliveryBar from "../../components/cart/FreeDeliveryBar";
import PromoCodeForm from "../../components/cart/PromoCodeForm";
import Breadcrumb from "../../components/common/Breadcrumb";
import StepTracker from "../../components/common/StepTracker";
import { useCart } from "../../context/CartContext";
import { api } from "../../utils/api";
import { plural } from "../../utils/format";
import {
  clearSavedPromo,
  getSavedPromo,
  savePromo,
  type PromoResult,
} from "../../utils/promo";

const perks = [
  {
    title: "30-Day Easy Returns",
    text: "Hassle-free pickups",
    icon: MdOutlineAutorenew,
  },
  {
    title: "Fast Dispatch",
    text: "Within 24–48 hours",
    icon: MdOutlineLocalShipping,
  },
  {
    title: "100% Authentic",
    text: "Direct from brands",
    icon: MdOutlineVerified,
  },
];

const CartPage = () => {
  const { items, count, subtotal, clearCart } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);

  // ---- The promo code ----
  // The code to use (remembered from earlier in this tab), and the server's last answer, labelled with the
  // code and subtotal it was for. When the subtotal changes (you change a quantity), the code is checked again:
  // QUICK25 needs ₦25,000, so removing items can make it stop working.
  const [code, setCode] = useState(getSavedPromo);
  const [check, setCheck] = useState<{
    key: string;
    result?: PromoResult;
    error?: string;
  } | null>(null);
  const key = `${code}|${subtotal}`;

  useEffect(() => {
    if (!code || subtotal <= 0) return;
    let cancelled = false; // set by the clean-up if a newer check starts before this one answers
    api<PromoResult>("/promo-codes/check", {
      method: "POST",
      body: { code, subtotal },
    })
      .then((result) => {
        if (cancelled) return;
        setCheck({ key, result });
        savePromo(result.code); // remember it for checkout
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setCheck({ key, error: error.message }); // e.g. "QUICK25 needs an order of at least ₦25,000. Add ₦5,000 more..."
        clearSavedPromo();
      });
    return () => {
      cancelled = true;
    };
  }, [code, subtotal, key]);

  // Worked out from the answer (like useApi): no answer for THIS code and subtotal yet = still checking
  const checking = Boolean(code) && check?.key !== key;
  const applied = !checking && check?.result ? check.result : null;
  const promoError = !checking && check?.error ? check.error : "";

  const removePromo = () => {
    setCode("");
    setCheck(null);
    clearSavedPromo();
  };

  // How much the sale prices save: (old price − price) × quantity, for the items on sale
  const saved = items.reduce(
    (sum, item) =>
      sum +
      (item.oldPrice && item.oldPrice > item.price
        ? (item.oldPrice - item.price) * item.quantity
        : 0),
    0,
  );

  return (
    <div className="mx-auto max-w-360 px-4 pt-8 pb-20 md:px-12">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Cart" }]} />
      <StepTracker current={1} />

      <p className="text-xs font-bold tracking-wider text-primary uppercase">
        Checkout pipeline
      </p>
      <h1 className="mt-1 mb-8 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
        Your Shopping Cart{" "}
        <span className="text-2xl font-normal text-ink-soft">
          ({plural(count, "item")})
        </span>
      </h1>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_400px]">
          <div className="flex flex-col gap-4">
            <FreeDeliveryBar saved={saved} />

            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <CartItem key={item.key} item={item} />
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/shop"
                className="flex items-center gap-1.5 text-lg font-medium text-primary-hover hover:underline"
              >
                <MdArrowBack size={20} aria-hidden="true" /> Continue Shopping
              </Link>

              {/* Two clicks to empty the cart, so it can't happen by accident (no browser pop-up needed) */}
              {confirmClear ? (
                <p className="flex items-center gap-3 text-sm">
                  <span className="text-ink-soft">Remove everything?</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      removePromo();
                      setConfirmClear(false);
                    }}
                    className="font-semibold text-danger hover:underline"
                  >
                    Yes, clear cart
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="font-semibold text-ink-soft hover:underline"
                  >
                    Cancel
                  </button>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-danger"
                >
                  <MdOutlineRemoveShoppingCart size={18} aria-hidden="true" />{" "}
                  Clear Entire Cart
                </button>
              )}
            </div>

            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {perks.map((perk) => (
                <li
                  key={perk.title}
                  className="flex items-center gap-3 rounded-2xl bg-panel p-4"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
                    <perk.icon size={20} aria-hidden="true" />
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold text-ink">
                      {perk.title}
                    </span>
                    <span className="text-ink-soft">{perk.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <CartSummary
            units={count}
            subtotal={subtotal}
            discount={applied?.discount ?? 0}
            promoCode={applied?.code}
            promoForm={
              <PromoCodeForm
                applied={applied}
                error={promoError}
                checking={checking}
                onApply={setCode}
                onRemove={removePromo}
              />
            }
          />
        </div>
      )}
    </div>
  );
};

export default CartPage;
