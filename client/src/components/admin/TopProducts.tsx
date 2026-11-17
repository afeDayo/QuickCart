// TopProducts.tsx client/src/components/admin/TopProducts.tsx
// "Top-Selling Products: by volume sold": from the orders in the chosen period (server STEP 27), with revenue.

// STEP 41 (part 9): Top products

import { MdOutlineStars } from "react-icons/md";
import type { DashboardResponse } from "../../types/admin";
import { naira } from "../../utils/format";

const TopProducts = ({
  products,
}: {
  products: DashboardResponse["topProducts"];
}) => {
  return (
    <section
      aria-labelledby="top-products-title"
      className="rounded-3xl bg-surface p-6 shadow-card"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2
            id="top-products-title"
            className="text-xl font-semibold text-ink"
          >
            Top-Selling Products
          </h2>
          <p className="text-sm text-ink-soft">By units sold in this period</p>
        </div>
        <MdOutlineStars size={24} aria-hidden="true" className="text-primary" />
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-ink-soft">No sales in this period yet.</p>
      ) : (
        <ol className="flex flex-col divide-y divide-line">
          {products.map((product) => (
            <li
              key={product.productId}
              className="flex items-center gap-3 py-3"
            >
              <img
                src={product.image}
                alt=""
                className="size-12 shrink-0 rounded-xl bg-field object-cover"
              />
              <span className="min-w-0 flex-1 text-sm">
                <span className="block truncate font-semibold text-ink">
                  {product.name}
                </span>
                <span className="text-muted">SKU: {product.sku}</span>
              </span>
              <span className="text-right text-sm">
                <span className="block font-bold text-ink">
                  {naira(product.revenue)}
                </span>
                <span className="font-semibold text-success">
                  {product.sold} sold
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default TopProducts;
