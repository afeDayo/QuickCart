// RecentOrdersTable.tsx client/src/components/admin/RecentOrdersTable.tsx
// "Recent Orders" on the dashboard: the 5 newest orders from every customer, with "View All Orders (41)".

// STEP 41 (part 8): Recent orders

import { MdArrowForward } from "react-icons/md";
import { Link } from "react-router-dom";
import type { DashboardResponse } from "../../types/admin";
import { shortDateTime } from "../../utils/dates";
import { naira } from "../../utils/format";
import StatusPill from "../common/StatusPill";

const PAYMENT = {
  paid: "bg-mint/40 text-forest",
  pending: "bg-[#fff4e0] text-[#8a5300]",
  refunded: "bg-info-light text-primary",
};

const RecentOrdersTable = ({
  orders,
  total,
}: {
  orders: DashboardResponse["recentOrders"];
  total: number;
}) => {
  return (
    <section
      aria-labelledby="admin-recent-title"
      className="overflow-hidden rounded-3xl bg-surface shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <h2
            id="admin-recent-title"
            className="text-2xl font-semibold text-ink"
          >
            Recent Orders
          </h2>
          <p className="text-sm text-ink-soft">
            The newest orders from every customer
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="flex items-center gap-1 font-semibold text-primary-hover hover:underline"
        >
          View All Orders ({total}){" "}
          <MdArrowForward size={18} aria-hidden="true" />
        </Link>
      </div>

      {/* A real table: screen readers can say "row 2, Customer: Ada Obi". overflow-x-auto: it scrolls sideways on phones. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-left text-sm whitespace-nowrap">
          <thead className="bg-panel text-xs font-bold tracking-wider text-ink-soft uppercase">
            <tr>
              <th scope="col" className="px-6 py-3">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3">
                Customer
              </th>
              <th scope="col" className="px-6 py-3">
                Date &amp; Time
              </th>
              <th scope="col" className="px-6 py-3">
                Total
              </th>
              <th scope="col" className="px-6 py-3">
                Payment
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-panel/50">
                <td className="px-6 py-4 font-bold text-primary-hover">
                  #{order.orderNumber}
                </td>
                <td className="px-6 py-4">
                  <span className="block font-semibold text-ink">
                    {order.contact.firstName} {order.contact.lastName}
                  </span>
                  <span className="text-muted">{order.contact.email}</span>
                </td>
                <td className="px-6 py-4 text-ink-soft">
                  {shortDateTime(order.createdAt)}
                </td>
                <td className="px-6 py-4 text-base font-bold text-ink">
                  {naira(order.total)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${PAYMENT[order.payment.status]}`}
                  >
                    {order.payment.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && (
        <p className="p-6 text-ink-soft">No orders yet.</p>
      )}
    </section>
  );
};

export default RecentOrdersTable;
