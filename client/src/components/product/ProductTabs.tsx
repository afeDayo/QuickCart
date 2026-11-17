// ProductTabs.tsx client/src/components/product/ProductTabs.tsx
// "Full Specifications | Customer Reviews (248) | Shipping & Returns". Only one panel shows at a time.
// The page decides which tab is open, so "Write a review" at the top can open the Reviews tab.

// STEP 35 (part 12): The tabs

import {
  MdOutlineLocalShipping,
  MdOutlineRateReview,
  MdTune,
} from "react-icons/md";
import type { Product } from "../../types/api";
import ProductReviews from "./ProductReviews";

export type TabName = "specs" | "reviews" | "shipping";

type ProductTabsProps = {
  product: Product;
  tab: TabName;
  onTabChange: (tab: TabName) => void;
  onReviewed: () => void;
};

const ProductTabs = ({
  product,
  tab,
  onTabChange,
  onReviewed,
}: ProductTabsProps) => {
  const tabs = [
    { name: "specs" as const, label: "Full Specifications", icon: MdTune },
    {
      name: "reviews" as const,
      label: `Customer Reviews (${product.reviewCount})`,
      icon: MdOutlineRateReview,
    },
    {
      name: "shipping" as const,
      label: "Shipping & Returns",
      icon: MdOutlineLocalShipping,
    },
  ];

  // The specs come as one list: group them by "group" ("Audio & Connectivity", "Power, Build & Box Contents")
  const groups = new Map<string, Product["specs"]>();
  for (const spec of product.specs) {
    groups.set(spec.group, [...(groups.get(spec.group) ?? []), spec]);
  }

  return (
    <section
      id="product-tabs"
      className="scroll-mt-28 rounded-3xl bg-surface p-6 shadow-card md:p-8"
    >
      {/* role="tablist" / "tab" / "tabpanel": screen readers announce "tab 2 of 3, selected" */}
      <div
        role="tablist"
        aria-label="Product information"
        className="mb-6 flex gap-6 overflow-x-auto border-b border-line"
      >
        {tabs.map((item) => (
          <button
            key={item.name}
            type="button"
            role="tab"
            id={`tab-${item.name}`}
            aria-selected={tab === item.name}
            aria-controls={`panel-${item.name}`}
            onClick={() => onTabChange(item.name)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 pb-3 text-base font-semibold transition-colors ${
              tab === item.name
                ? "border-primary text-primary"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            <item.icon size={18} aria-hidden="true" /> {item.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "specs" &&
          (product.specs.length === 0 ? (
            <p className="text-ink-soft">
              No specifications listed for this product.
            </p>
          ) : (
            <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
              {[...groups].map(([group, specs]) => (
                <div key={group}>
                  <h3 className="mb-2 font-semibold text-ink">{group}</h3>
                  {/* <dl>: a "description list", the HTML for label/value pairs */}
                  <dl>
                    {specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex justify-between gap-4 border-b border-line py-2.5 text-sm"
                      >
                        <dt className="text-muted">{spec.label}</dt>
                        <dd className="text-right font-medium text-ink">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          ))}

        {tab === "reviews" && (
          <ProductReviews product={product} onReviewed={onReviewed} />
        )}

        {/* The same rules as the server's checkout (DELIVERY_OPTIONS and the 1-hour cancel, server STEP 22) */}
        {tab === "shipping" && (
          <div className="grid gap-6 text-[15px] leading-6 text-ink-soft md:grid-cols-3">
            <div>
              <h3 className="mb-1 font-semibold text-ink">
                Standard Delivery: Free
              </h3>
              <p>2–3 business days anywhere in Nigeria.</p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-ink">
                Express Same-Day: ₦2,500
              </h3>
              <p>
                Delivered today in Lagos. Pay on Delivery is also available in
                Lagos.
              </p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-ink">
                Changed your mind?
              </h3>
              <p>
                Cancel free of charge within 1 hour of placing your order, from
                My Orders.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductTabs;
