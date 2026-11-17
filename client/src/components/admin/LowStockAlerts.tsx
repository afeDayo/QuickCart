// LowStockAlerts.tsx client/src/components/admin/LowStockAlerts.tsx
// "Low-Stock Alerts · 3 Urgent": products at or below their alert level (server STEP 27), lowest first.

// STEP 41 (part 10): Low-stock alerts

import { MdArrowForward, MdWarningAmber } from "react-icons/md";
import { Link } from "react-router-dom";
import type { DashboardResponse } from "../../types/admin";

const LowStockAlerts = ({
  items,
  total,
}: {
  items: DashboardResponse["lowStock"];
  total: number;
}) => {
  return (
    <section
      aria-labelledby="low-stock-title"
      className="rounded-3xl border-l-4 border-danger bg-surface p-6 shadow-card"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2
          id="low-stock-title"
          className="flex items-center gap-2 text-xl font-semibold text-ink"
        >
          <MdWarningAmber
            size={22}
            aria-hidden="true"
            className="text-danger"
          />{" "}
          Low-Stock Alerts
        </h2>
        {total > 0 && (
          <span className="rounded-full bg-danger-light px-2.5 py-1 text-xs font-bold text-danger">
            {total} Urgent
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-ink-soft">Everything is well stocked. 🎉</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item._id}>
              <Link
                to={`/admin/products/${item._id}/edit`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-panel p-3 hover:bg-field"
              >
                <span className="min-w-0 text-sm">
                  <span className="block truncate font-semibold text-ink">
                    {item.name}
                  </span>
                  <span className="text-muted">SKU: {item.sku}</span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${item.stock <= 2 ? "bg-danger-light text-danger" : "bg-[#fff4e0] text-[#8a5300]"}`}
                >
                  {item.stock === 0 ? "Sold out" : `${item.stock} left`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        to="/admin/products?tab=low-stock"
        className="mt-4 flex h-11 items-center justify-center gap-1 rounded-xl bg-primary-light/60 font-semibold text-primary-hover hover:bg-primary-light"
      >
        View All Low Stock Items <MdArrowForward size={18} aria-hidden="true" />
      </Link>
    </section>
  );
};

export default LowStockAlerts;
