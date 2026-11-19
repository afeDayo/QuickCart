// PackageContents.tsx client/src/components/order/PackageContents.tsx
// "Itemized Package Content": each item with its SKU, colour, quantity, unit price and subtotal, as it was when you
// ordered it (the order's own copy, server STEP 22). Delivered? Each item gets "Leave a review".

// STEP 40 (part 5): The package contents

import { MdOutlinePolicy, MdOutlineRateReview } from "react-icons/md";
import { Link } from "react-router-dom";
import type { Order } from "../../types/api";
import { naira, plural } from "../../utils/format";

const PackageContents = ({ order }: { order: Order }) => {
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section
      aria-labelledby="package-title"
      className="rounded-3xl bg-surface p-6 shadow-card max-sm:p-4"
    >
      <h2 id="package-title" className="text-xl font-semibold text-ink">
        Itemized Package Content
      </h2>
      <p className="mb-5 text-sm text-ink-soft">
        {plural(count, "product")} in one protected parcel
      </p>

      <ul className="flex flex-col gap-3">
        {order.items.map((item) => (
          <li
            key={`${item.product}-${item.color}`}
            className="flex flex-wrap items-center gap-4 rounded-2xl bg-panel/70 p-4 max-sm:gap-3 max-sm:p-3"
          >
            <img
              src={item.image}
              alt=""
              className="size-20 shrink-0 rounded-xl bg-field object-cover max-sm:size-16"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-wide text-ink-soft">
                SKU: {item.sku}
              </p>
              <Link
                to={`/product/${item.product}`}
                className="text-lg font-semibold text-ink hover:text-primary max-sm:text-base"
              >
                {item.name}
              </Link>
              <p className="text-sm text-ink-soft">
                {item.color && <>Color: {item.color} · </>}Qty: {item.quantity}{" "}
                · Unit: {naira(item.price)}
              </p>
              {order.status === "delivered" && (
                <Link
                  to={`/product/${item.product}#reviews`}
                  className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary-hover hover:underline"
                >
                  <MdOutlineRateReview size={16} aria-hidden="true" /> Leave a
                  review
                </Link>
              )}
            </div>
            <p className="text-right max-sm:flex max-sm:w-full max-sm:items-baseline max-sm:justify-between max-sm:border-t max-sm:border-line max-sm:pt-2">
              <span className="block text-sm text-ink-soft">Item Subtotal</span>
              <span className="text-xl font-bold text-ink">
                {naira(item.lineTotal)}
              </span>
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex items-center gap-2 rounded-2xl bg-panel px-4 py-3 text-sm text-ink-soft">
        <MdOutlinePolicy
          size={18}
          aria-hidden="true"
          className="shrink-0 text-success"
        />
        All items are covered by the QuickCart 7-Day Free Replacement &amp;
        Return Policy.
      </p>
    </section>
  );
};

export default PackageContents;
