// promo.ts server/src/utils/promo.ts
// Checks a promo code and works out its discount. Used by the cart's Apply button AND by checkout (STEP 22),
// so both always agree.

// STEP 21 (part 3): Promo code rules

import { IPromoCode, PromoCode } from "../models/PromoCode";
import { AppError } from "./AppError";

// 25000 -> "₦25,000" (toLocaleString adds the commas the Nigerian way)
export const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

// How much this code takes off this subtotal, in whole naira
export const discountFor = (promo: IPromoCode, subtotal: number) => {
  // fixed: the value itself (2000). percent: that % of the subtotal (10% of 18500 = 1850)
  let discount =
    promo.type === "percent" ? (subtotal * promo.value) / 100 : promo.value;

  if (promo.maxDiscount !== undefined) {
    discount = Math.min(discount, promo.maxDiscount); // QUICK10 never takes off more than ₦5,000
  }

  discount = Math.min(discount, subtotal); // never more than the order itself (no negative totals)

  return Math.round(discount); // naira, no kobo: 1234.5 -> 1235
};

// applyPromo("quick25", 117500) -> { promo, discount: 2000 }
// Throws a 400 with a message the cart can show if the code can't be used.
export const applyPromo = async (code: unknown, subtotal: number) => {
  const cleanCode = String(code ?? "")
    .toUpperCase()
    .trim(); // " quick25 " -> "QUICK25"

  if (!cleanCode) {
    throw new AppError(400, "Please enter a promo code.");
  }

  const promo = await PromoCode.findOne({ code: cleanCode });

  // Doesn't exist, switched off, or expired: the shopper doesn't need to know which
  if (
    !promo ||
    !promo.isActive ||
    (promo.expiresAt && promo.expiresAt.getTime() < Date.now())
  ) {
    throw new AppError(400, `"${cleanCode}" is not a valid promo code.`);
  }

  // Too small an order? Tell them how much more to add (that sells more!)
  if (subtotal < promo.minSubtotal) {
    throw new AppError(
      400,
      `${promo.code} needs an order of at least ${naira(promo.minSubtotal)}. Add ${naira(promo.minSubtotal - subtotal)} more to use it.`,
    );
  }

  return { promo, discount: discountFor(promo, subtotal) };
};
