// orderRules.ts server/src/utils/orderRules.ts
// The shop's order rules in one place: delivery prices, delivery dates, the 1-hour cancel window,
// Lagos-only options and the pretend card payment.

// STEP 22 (part 3): Order rules

import { randomInt } from "crypto";
import { AppError } from "./AppError";

// The checkout's "Delivery Method" box
export const DELIVERY_OPTIONS = {
  standard: { label: "Standard Delivery", fee: 0, minDays: 2, maxDays: 3 }, // Free, 2-3 business days
  express: {
    label: "Express Same-Day Dispatch",
    fee: 2500,
    minDays: 0,
    maxDays: 0,
  }, // ₦2,500, today (Lagos only)
};

export type DeliveryMethod = keyof typeof DELIVERY_OPTIONS; // "standard" | "express"

export const CANCEL_WINDOW_MINUTES = 60; // "Free cancellation available within 1 hour of placement"

// Express delivery and Pay on Delivery are "Lagos Metro Only" in the designs
export const isLagos = (state: unknown) => /lagos/i.test(String(state ?? "")); // "Lagos State", "lagos" -> true

// Monday + 2 business days = Wednesday. Friday + 2 = Tuesday (Saturday and Sunday are skipped).
export const addBusinessDays = (start: Date, days: number) => {
  const date = new Date(start);
  let added = 0;

  while (added < days) {
    date.setDate(date.getDate() + 1); // the next day
    const weekday = date.getDay(); // 0 = Sunday, 6 = Saturday
    if (weekday !== 0 && weekday !== 6) added++;
  }

  return date;
};

// "Estimated Delivery: Oct 26 - Oct 27"
export const estimateDelivery = (method: DeliveryMethod, placedAt: Date) => {
  const option = DELIVERY_OPTIONS[method];
  return {
    from: addBusinessDays(placedAt, option.minDays),
    to: addBusinessDays(placedAt, option.maxDays),
  };
};

// The last moment the order can be cancelled: placed + 60 minutes
export const cancelDeadline = (order: { createdAt: Date }) =>
  new Date(order.createdAt.getTime() + CANCEL_WINDOW_MINUTES * 60 * 1000);

// Shows or hides the "Cancel Order" button: still being packed AND within the hour
export const canCancel = (order: { status: string; createdAt: Date }) =>
  order.status === "processing" && Date.now() < cancelDeadline(order).getTime();

// Oct 24, 2026 (for emails)
export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// "4..." Visa, "51-55..." or "22-27..." Mastercard, "506/507/650..." Verve
const cardBrand = (digits: string) => {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^(506|507|650)/.test(digits)) return "Verve";
  return "Card";
};

// A PRETEND card payment ("Simulated environment for capstone UI" in the checkout design).
// It checks the card looks right, then "pays". No money moves and the card details are never saved.
// Any card number ending in 0000 is declined, so you can demo a failed payment.
export const chargeCard = (card: unknown) => {
  const { number, expiry, cvv } = (card ?? {}) as Record<string, unknown>;

  const digits = String(number ?? "").replace(/\D/g, ""); // "4242 4242 4242 4242" -> "4242424242424242"
  if (digits.length < 12 || digits.length > 19) {
    throw new AppError(400, "Please enter a valid card number.");
  }

  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(String(expiry ?? "").trim()); // "08/28" -> ["08/28", "08", "28"]
  const month = Number(match?.[1]);
  if (!match || month < 1 || month > 12) {
    throw new AppError(
      400,
      "Please enter the expiry date as MM/YY, e.g. 08/28.",
    );
  }

  // A card that says 08/28 works until the END of August 2028, i.e. until 1 September 2028.
  // (new Date(year, 8, 1) = 1 September, because JavaScript counts months from 0.)
  const firstDayAfterExpiry = new Date(2000 + Number(match[2]), month, 1);
  if (firstDayAfterExpiry.getTime() <= Date.now()) {
    throw new AppError(400, "This card has expired.");
  }

  if (!/^\d{3,4}$/.test(String(cvv ?? ""))) {
    throw new AppError(
      400,
      "Please enter the 3-digit CVV from the back of your card.",
    );
  }

  if (digits.endsWith("0000")) {
    throw new AppError(402, "Your card was declined. Please try another card."); // 402 = Payment Required
  }

  return {
    cardBrand: cardBrand(digits),
    cardLast4: digits.slice(-4), // the ONLY part of the number we keep
    reference: `PSTK-${randomInt(100000000, 1000000000)}`, // "PSTK-991204812"
    paidAt: new Date(),
  };
};
