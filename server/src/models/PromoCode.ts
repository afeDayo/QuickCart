// PromoCode model server/src/models/PromoCode.ts
// A discount code typed in the cart, e.g. QUICK25 = ₦2,000 off, QUICK10 = 10% off.

// STEP 21 (part 1): The PromoCode model

import { model, Schema } from "mongoose";

export interface IPromoCode {
  code: string; // always saved in CAPITALS, e.g. "QUICK25"
  description: string; // shown to the shopper, e.g. "₦2,000 off orders of ₦25,000 or more"
  type: "fixed" | "percent"; // fixed = a naira amount off; percent = a % of the subtotal off
  value: number; // 2000 (naira) for fixed, 10 (%) for percent
  maxDiscount?: number; // the most a percent code can take off, e.g. 5000
  minSubtotal: number; // the smallest order it works on, in naira
  isActive: boolean; // false = switched off
  expiresAt?: Date; // after this date the code stops working (no date = never expires)
  usedCount: number; // how many orders used it (counted in STEP 22)
}

const promoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: "" },
    type: { type: String, enum: ["fixed", "percent"], required: true },
    value: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const PromoCode = model<IPromoCode>("PromoCode", promoCodeSchema);
