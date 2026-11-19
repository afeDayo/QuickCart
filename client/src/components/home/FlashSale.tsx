// FlashSale.tsx client/src/components/home/FlashSale.tsx
// "FLASH SUPER SALE · ENDING SOON / Limited Rush Deals": the blue banner with a countdown to midnight,
// and the products tagged "flash-deal".

// STEP 33 (part 4): The flash sale

import { MdBolt } from "react-icons/md";
import { useApi } from "../../hooks/useApi";
import { useCountdown } from "../../hooks/useCountdown";
import type { ProductsResponse } from "../../types/api";
import FlashDealCard from "../product/FlashDealCard";

// The sale "ends" at midnight tonight (the shopper's time). Worked out once, when the file loads.
const midnight = new Date();
midnight.setHours(24, 0, 0, 0); // 24:00 today = 00:00 tomorrow

// 7 -> "07"
const twoDigits = (value: number) => String(value).padStart(2, "0");

const FlashSale = () => {
  const { data, error, loading } = useApi<ProductsResponse>(
    "/products?tag=flash-deal&limit=4",
  );
  const { hours, minutes, seconds } = useCountdown(midnight);

  if (error || (!loading && !data?.products.length)) return null;

  const units = [
    { value: hours, label: "Hours" },
    { value: minutes, label: "Mins" },
    { value: seconds, label: "Secs" },
  ];

  return (
    // id="flash-sale": the footer's "Daily Flash Deals" link jumps here (/#flash-sale)
    <section
      id="flash-sale"
      aria-labelledby="flash-title"
      className="scroll-mt-28"
    >
      <div className="mb-6 flex flex-col gap-6 overflow-hidden rounded-3xl bg-linear-to-r from-primary to-primary-hover p-8 text-white shadow-banner md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-3 flex w-fit items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide uppercase">
            <MdBolt size={14} aria-hidden="true" className="text-mint" /> Flash
            super sale · Ending soon
          </p>
          <h2
            id="flash-title"
            className="text-3xl leading-9 font-bold tracking-tight"
          >
            Limited Rush Deals — Save Up to 50%
          </h2>
          <p className="mt-2 max-w-100 text-[15px] leading-6 text-white/80">
            Genuine items in strictly limited stock. Prices reset immediately
            after the countdown ends.
          </p>
        </div>

        {/* role="timer" + aria-live="off": screen readers don't read it out every second */}
        <div
          role="timer"
          aria-live="off"
          aria-label={`Ends in ${hours} hours ${minutes} minutes`}
          className="flex items-center gap-2"
        >
          {units.map((unit, index) => (
            <div key={unit.label} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-xl font-bold">
                  :
                </span>
              )}
              <span className="flex w-17 flex-col items-center rounded-xl bg-ink/30 py-2.5">
                {/* key={value}: each new number is a new element, so the "tick" animation plays */}
                <span
                  key={unit.value}
                  className="animate-tick text-xl leading-6 font-bold"
                >
                  {twoDigits(unit.value)}
                </span>
                <span className="text-[10px] tracking-wide text-white/70 uppercase">
                  {unit.label}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-sm:grid-cols-2 max-sm:gap-3">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <li
                key={index}
                aria-hidden="true"
                className="h-120 animate-pulse rounded-3xl bg-surface shadow-card"
              />
            ))
          : data?.products.map((product) => (
              <li key={product._id} className="flex">
                <FlashDealCard product={product} />
              </li>
            ))}
      </ul>
    </section>
  );
};

export default FlashSale;
