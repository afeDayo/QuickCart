// Price.tsx client/src/components/common/Price.tsx
// "₦45,000 ₦60,000" (the second one crossed out when the product is on sale). Used on every product card.

// STEP 32 (part 6): Price

import { naira } from "../../utils/format";

type PriceProps = {
  price: number;
  oldPrice?: number;
  size?: "sm" | "md" | "lg";
};

const SIZES = { sm: "text-[15px]", md: "text-lg", lg: "text-3xl" };

const Price = ({ price, oldPrice, size = "md" }: PriceProps) => {
  const onSale = oldPrice !== undefined && oldPrice > price;

  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className={`${SIZES[size]} leading-tight font-bold text-ink`}>
        {naira(price)}
      </span>
      {onSale && (
        <>
          <span className="sr-only">, was</span>
          <del className="text-[13px] text-muted">{naira(oldPrice)}</del>
        </>
      )}
    </p>
  );
};

export default Price;
