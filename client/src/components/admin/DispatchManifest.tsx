// DispatchManifest.tsx client/src/components/admin/DispatchManifest.tsx
// "Print Manifest" (design: Admin - Orders Management): a printed list of the orders waiting to be shipped, for the
// person packing them: order, customer, phone, city, items, cash to collect, and a box to sign.
// It's hidden on screen (hidden) and is the only thing on the page when printing (print:block).

// STEP 43 (part 4): The dispatch manifest

import type { AdminOrderRow } from "../../types/admin";
import { longDate } from "../../utils/dates";
import { naira } from "../../utils/format";

type DispatchManifestProps = { orders: AdminOrderRow[]; printedAt: string }; // printedAt: when Print was clicked

const DispatchManifest = ({ orders, printedAt }: DispatchManifestProps) => {
  // Pay on delivery: the rider must collect the money
  const toCollect = orders
    .filter((order) => order.payment.status === "pending")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="hidden text-black print:block">
      <h1 className="text-2xl font-bold">QuickCart · Dispatch Manifest</h1>
      <p className="mb-4 text-sm">
        {longDate(printedAt)} · {orders.length} orders waiting to ship · cash to
        collect: {naira(toCollect)}
      </p>
      {orders.length === 0 ? (
        <p>No orders are waiting to be shipped.</p>
      ) : (
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-1 pr-2">Order</th>
              <th className="py-1 pr-2">Customer</th>
              <th className="py-1 pr-2">Phone</th>
              <th className="py-1 pr-2">City</th>
              <th className="py-1 pr-2">Items</th>
              <th className="py-1 pr-2">Collect</th>
              <th className="w-28 py-1">Signature</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-b border-gray-400 align-top"
              >
                <td className="py-2 pr-2 font-bold">#{order.orderNumber}</td>
                <td className="py-2 pr-2">
                  {order.contact.firstName} {order.contact.lastName}
                </td>
                <td className="py-2 pr-2">{order.contact.phone}</td>
                <td className="py-2 pr-2">
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </td>
                <td className="py-2 pr-2">
                  {order.items.map((item) => (
                    <div key={item.name}>
                      {item.quantity} × {item.name}
                    </div>
                  ))}
                </td>
                <td className="py-2 pr-2">
                  {order.payment.status === "pending"
                    ? naira(order.total)
                    : "Paid"}
                </td>
                <td className="py-2" />
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DispatchManifest;
