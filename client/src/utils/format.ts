// format.ts client/src/utils/format.ts
// Small helpers to show values the Nigerian way.

// STEP 32 (part 1): Formatting

// 45000 -> "₦45,000" (prices are whole naira everywhere, like the server)
export const naira = (amount: number) =>
  `₦${Math.round(amount).toLocaleString("en-NG")}`;

// 1 -> "1 item", 3 -> "3 items"
export const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;
