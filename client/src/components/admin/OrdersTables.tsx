// OrdersTables.tsx client/src/components/admin/OrdersTables.tsx
// The orders table (design: Admin - Orders Management): order number and waybill, customer, date and city, items,
// total, payment, status, and a Manage button that opens the order's panel.

// STEP 43 (part 2): The orders table

import { MdChevronRight } from "react-icons/md";
import type { AdminOrderRow } from "../../types/admin";
import { shortDateTime } from "../../utils/dates";
import { naira, plural } from "../../utils/format";
import StatusPill from "../common/StatusPill";

// The payment pill: "● Paid", "● Pending", "● Refunded" (with "Visa" or "Pay on delivery" under it)
const PAYMENT_STYLES = {
  paid: { label: "Paid", classes: "bg-mint/40 text-forest" },
  pending: { label: "Pending", classes: "bg-[#fff4e0] text-[#8a5300]" },
  refunded: { label: "Refunded", classes: "bg-danger-light text-danger" },
};

const initials = (first: string, last: string) =>
  `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

type OrdersTablesProps = {
  orders: AdminOrderRow[];
  onOpen: (orderNumber: string) => void;
};

const OrdersTables = ({ orders, onOpen }: OrdersTablesProps) => {
  return (
    // relative: keeps the sr-only header text inside the scroll box (the STEP 42 phone fix)
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-220 text-left text-sm">
        <thead className="bg-panel text-xs font-bold tracking-wider text-ink-soft uppercase">
          <tr>
            <th scope="col" className="px-6 py-3">
              Order ID
            </th>
            <th scope="col" className="px-4 py-3">
              Customer
            </th>
            <th scope="col" className="px-4 py-3">
              Date & time
            </th>
            <th scope="col" className="px-4 py-3">
              Items
            </th>
            <th scope="col" className="px-4 py-3">
              Total
            </th>
            <th scope="col" className="px-4 py-3">
              Payment
            </th>
            <th scope="col" className="px-4 py-3">
              Status
            </th>
            <th scope="col" className="py-3 pr-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((order) => {
            const { contact, payment } = order;
            const pay = PAYMENT_STYLES[payment.status];
            const count = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );
            return (
              <tr key={order._id} className="hover:bg-panel/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onOpen(order.orderNumber)}
                    className="text-base font-bold text-primary-hover hover:underline"
                  >
                    #{order.orderNumber}
                  </button>
                  <p className="text-xs text-ink-soft">
                    {order.waybill ?? "No waybill yet"}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary-hover"
                    >
                      {initials(contact.firstName, contact.lastName)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold whitespace-nowrap text-ink">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-xs text-ink-soft">{contact.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="whitespace-nowrap text-ink">
                    {shortDateTime(order.createdAt)}
                  </p>
                  <p className="max-w-44 text-xs text-ink-soft">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                </td>
                <td className="py-4 pr-6 pl-4 whitespace-nowrap">
                  <span className="flex items-center gap-2 text-ink-soft">
                    {order.items[0]?.image && (
                      <img
                        src={order.items[0].image}
                        alt=""
                        className="size-9 rounded-lg bg-field object-cover"
                      />
                    )}
                    {plural(count, "item")}
                  </span>
                </td>
                <td className="px-4 py-4 text-base font-bold whitespace-nowrap text-ink">
                  {naira(order.total)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${pay.classes}`}
                  >
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-current"
                    />
                    {pay.label}
                  </span>
                  <p className="mt-1 text-xs text-ink-soft">
                    {payment.method === "card"
                      ? (payment.cardBrand ?? "Card")
                      : "Pay on delivery"}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <StatusPill status={order.status} />
                </td>
                <td className="py-4 pr-4">
                  <button
                    type="button"
                    onClick={() => onOpen(order.orderNumber)}
                    aria-label={`Manage order ${order.orderNumber}`}
                    className="flex size-9 items-center justify-center rounded-lg text-primary-hover hover:bg-primary-light"
                  >
                    <MdChevronRight size={22} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTables;
