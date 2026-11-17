// promo.ts client/src/utils/promo.ts
// Remembers the promo code applied in the cart until checkout (STEP 38), for this browser tab only (sessionStorage:
// closing the tab forgets it). The SERVER always checks the code again when the order is placed (server STEP 22),
// so changing it here can't fake a discount.

// STEP 36 (part 1): Remember the promo code

const KEY = "quickcart_promo";

export const getSavedPromo = () => sessionStorage.getItem(KEY) ?? "";
export const savePromo = (code: string) => sessionStorage.setItem(KEY, code);
export const clearSavedPromo = () => sessionStorage.removeItem(KEY);

// POST /api/promo-codes/check -> what the server answers (server STEP 21)
export type PromoResult = {
  code: string;
  description: string;
  discount: number;
  subtotalAfterDiscount: number;
};
