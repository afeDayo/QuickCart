// promoCodes.ts server/src/data/promoCodes.ts
// The demo promo codes. npm run seed saves them.

// STEP 21 (part 2): Demo promo codes

import type { IPromoCode } from "../models/PromoCode";

// Pick = only these fields (usedCount starts at 0 by itself)
export type DemoPromoCode = Pick<
  IPromoCode,
  "code" | "description" | "type" | "value" | "maxDiscount" | "minSubtotal"
>;

export const promoCodes: DemoPromoCode[] = [
  {
    code: "QUICK25",
    description: "₦2,000 off orders of ₦25,000 or more",
    type: "fixed",
    value: 2000,
    minSubtotal: 25000,
  },
  {
    code: "QUICK10",
    description: "10% off orders of ₦10,000 or more (up to ₦5,000)",
    type: "percent",
    value: 10,
    maxDiscount: 5000,
    minSubtotal: 10000,
  },
];
