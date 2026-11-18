// CustomerPanel.tsx client/src/components/admin/CustomerPanel.tsx
// The panel that slides over the customers table (like the order panel, STEP 43): contact details, the numbers,
// saved addresses and their orders. Clicking an order opens it on the Orders page.
// GET /api/admin/customers/:id (server STEP 26).

// STEP 44 (part 2): The customer panel

import { useEffect, type ReactNode } from "react";
import { MdClose, MdVerified } from "react-icons/md";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import type { AdminCustomerResponse } from "../../types/admin";
import { shortDate } from "../../utils/dates";
import { naira, plural } from "../../utils/format";
import StatusPill from "../common/StatusPill";

const Box = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-2xl bg-surface p-5 shadow-card">
    <h3 className="mb-3 text-xs font-bold tracking-wider text-ink-soft uppercase">
      {title}
    </h3>
    {children}
  </section>
);

type CustomerPanelProps = { customerId: string; onClose: () => void };

const CustomerPanel = ({ customerId, onClose }: CustomerPanelProps) => {
  const { data, error } = useApi<AdminCustomerResponse>(
    `/admin/customers/${customerId}`,
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const customer = data?.customer;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Customer details"
    >
      <button
        type="button"
        aria-label="Close the customer"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink/40"
      />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-page shadow-banner">
        <div className="flex items-start justify-between gap-4 border-b border-line bg-surface px-6 py-5">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
              {customer
                ? `${customer.firstName} ${customer.lastName}`
                : "Customer"}
              {customer?.isEmailVerified && (
                <MdVerified
                  size={20}
                  aria-label="Email verified"
                  className="text-primary"
                />
              )}
            </h2>
            {customer && (
              <p className="mt-1 text-sm text-ink-soft">
                Customer since {shortDate(customer.createdAt)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-field"
          >
            <MdClose size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error ? (
            <p
              role="alert"
              className="rounded-2xl bg-danger-light p-4 text-sm text-danger"
            >
              {error}
            </p>
          ) : !data || !customer ? (
            <div
              aria-busy="true"
              className="h-96 animate-pulse rounded-2xl bg-surface"
            />
          ) : (
            <div className="flex flex-col gap-4">
              {/* The 3 numbers */}
              <dl className="grid grid-cols-3 gap-3">
                {[
                  { label: "Orders", value: String(customer.orderCount) },
                  { label: "Total spent", value: naira(customer.totalSpent) },
                  {
                    label: "Last order",
                    value: customer.lastOrderAt
                      ? shortDate(customer.lastOrderAt)
                      : "—",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-surface p-4 shadow-card"
                  >
                    <dt className="text-xs font-semibold text-ink-soft uppercase">
                      {item.label}
                    </dt>
                    <dd className="mt-1 text-lg font-bold text-ink">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <Box title="Contact">
                <a
                  href={`mailto:${customer.email}`}
                  className="block text-primary hover:underline"
                >
                  {customer.email}
                </a>
                <p className="mt-1 text-sm text-ink-soft">
                  {customer.phone || "No phone number"} ·{" "}
                  {customer.isEmailVerified
                    ? "Email verified"
                    : "Email not verified yet"}
                </p>
              </Box>

              <Box title={`Saved addresses (${customer.addresses.length})`}>
                {customer.addresses.length === 0 ? (
                  <p className="text-sm text-ink-soft">No saved addresses.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {customer.addresses.map((address) => (
                      <li key={address._id} className="text-sm">
                        <p className="font-semibold text-ink">
                          {address.label}{" "}
                          {address.isDefault && (
                            <span className="ml-1 rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary-hover">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-ink-soft">
                          {address.fullName} · {address.phone}
                          <br />
                          {address.street}, {address.city}, {address.state}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Box>

              <Box
                title={
                  data.orders.length === 20
                    ? "Latest 20 orders"
                    : `Orders (${data.orders.length})`
                }
              >
                {data.orders.length === 0 ? (
                  <p className="text-sm text-ink-soft">No orders yet.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {data.orders.map((order) => (
                      <li key={order._id}>
                        {/* Opens the order's panel on the Orders page (?order=..., STEP 43) */}
                        <Link
                          to={`/admin/orders?order=${order.orderNumber}`}
                          className="flex items-center justify-between gap-3 py-3 hover:text-primary"
                        >
                          <span>
                            <span className="block font-semibold">
                              #{order.orderNumber}
                            </span>
                            <span className="text-xs text-ink-soft">
                              {shortDate(order.createdAt)} ·{" "}
                              {plural(
                                order.items.reduce(
                                  (sum, item) => sum + item.quantity,
                                  0,
                                ),
                                "item",
                              )}
                            </span>
                          </span>
                          <span className="flex items-center gap-3">
                            <StatusPill status={order.status} />
                            <span className="font-semibold text-ink">
                              {naira(order.total)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Box>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPanel;
