// OrderPanel.tsx client/src/components/admin/OrderPanel.tsx
// The panel that slides over the orders table when you click an order: customer, delivery address, items, money,
// the status history, and the buttons that move the order along:
//   Processing -> "Mark as Shipped" (courier + waybill) -> "Mark as Delivered"      (or "Cancel order" before delivery)
// GET /api/admin/orders/:orderNumber and PATCH /api/admin/orders/:orderNumber/status (server STEP 26).

// STEP 43 (part 3): The order panel

import { useEffect, useState, type ReactNode } from "react";
import {
  MdCheckCircleOutline,
  MdClose,
  MdLocalShipping,
  MdOutlineCancel,
} from "react-icons/md";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import type { AdminOrderResponse } from "../../types/admin";
import { announceCountsChanged } from "../../utils/adminEvents";
import { api } from "../../utils/api";
import { shortDate, shortDateTime } from "../../utils/dates";
import { naira } from "../../utils/format";
import StatusPill from "../common/StatusPill";

const Box = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-2xl bg-surface p-5 shadow-card">
    <h3 className="mb-3 text-xs font-bold tracking-wider text-ink-soft uppercase">
      {title}
    </h3>
    {children}
  </section>
);

type OrderPanelProps = {
  orderNumber: string;
  onClose: () => void;
  onChanged: () => void; // the list behind the panel loads again
};

const OrderPanel = ({ orderNumber, onClose, onChanged }: OrderPanelProps) => {
  const { showToast } = useToast();
  const { data, error, reload } = useApi<AdminOrderResponse>(
    `/admin/orders/${orderNumber}`,
  );

  const [courier, setCourier] = useState("");
  const [waybill, setWaybill] = useState("");
  const [reason, setReason] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  // Escape closes the panel, like most pop-ups
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const changeStatus = async (status: string) => {
    setBusy(true);
    setActionError("");
    try {
      const body =
        status === "shipped"
          ? {
              status,
              courier: courier || data?.couriers[0],
              waybill: waybill.trim(),
            }
          : status === "cancelled"
            ? { status, reason: reason.trim() }
            : { status };
      const { message } = await api<{ message: string }>(
        `/admin/orders/${orderNumber}/status`,
        { method: "PATCH", body },
      );
      showToast({
        type: "success",
        title: message,
        message: "The customer has been emailed.",
      }); // "Order #QC-1048 is now shipped."
      setConfirmCancel(false);
      setReason("");
      setWaybill("");
      reload(); // this panel
      onChanged(); // the table behind it
      announceCountsChanged(); // the menu's "4 New"
    } catch (err) {
      setActionError((err as Error).message); // e.g. "This order was just changed by someone else..."
    } finally {
      setBusy(false);
    }
  };

  const order = data?.order;
  const next = data?.nextStatuses ?? [];

  return (
    <div
      className="fixed inset-0 z-50 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${orderNumber}`}
    >
      <button
        type="button"
        aria-label="Close the order"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink/40"
      />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-page shadow-banner">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line bg-surface px-6 py-5">
          <div>
            <h2 className="flex flex-wrap items-center gap-3 text-2xl font-bold text-ink">
              #{orderNumber} {order && <StatusPill status={order.status} />}
            </h2>
            {order && (
              <p className="mt-1 text-sm text-ink-soft">
                Placed {shortDateTime(order.createdAt)}
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
          ) : !order ? (
            <div
              aria-busy="true"
              className="h-96 animate-pulse rounded-2xl bg-surface"
            />
          ) : (
            <div className="flex flex-col gap-4">
              {/* What can happen next */}
              <Box title="Next step">
                {next.length === 0 ? (
                  <p className="text-sm text-ink-soft">
                    {order.status === "delivered"
                      ? `Delivered ${order.deliveredAt ? shortDate(order.deliveredAt) : ""}. Nothing more to do.`
                      : `Cancelled${order.cancelReason ? `: ${order.cancelReason}` : ""}. Nothing more to do.`}
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {next.includes("shipped") && (
                      <div className="flex flex-col gap-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="text-sm font-medium text-ink">
                            Courier
                            <select
                              value={courier || data.couriers[0]}
                              onChange={(event) =>
                                setCourier(event.target.value)
                              }
                              className="mt-1.5 h-11 w-full cursor-pointer rounded-xl bg-field px-3 outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              {data.couriers.map((name) => (
                                <option key={name}>{name}</option>
                              ))}
                            </select>
                          </label>
                          <label className="text-sm font-medium text-ink">
                            Waybill number
                            <input
                              value={waybill}
                              onChange={(event) =>
                                setWaybill(event.target.value)
                              }
                              placeholder="Leave empty to make one"
                              className="mt-1.5 h-11 w-full rounded-xl bg-field px-3 uppercase outline-none placeholder:normal-case placeholder:text-muted focus:ring-2 focus:ring-primary/30"
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => changeStatus("shipped")}
                          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-hover font-semibold text-white hover:bg-primary disabled:opacity-60"
                        >
                          <MdLocalShipping size={20} aria-hidden="true" /> Mark
                          as Shipped
                        </button>
                      </div>
                    )}

                    {next.includes("delivered") && (
                      <div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => changeStatus("delivered")}
                          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest font-semibold text-white hover:opacity-90 disabled:opacity-60"
                        >
                          <MdCheckCircleOutline size={20} aria-hidden="true" />{" "}
                          Mark as Delivered
                        </button>
                        {order.payment.status === "pending" && (
                          <p className="mt-2 text-xs text-ink-soft">
                            Pay on delivery: this also marks the{" "}
                            {naira(order.total)} as paid (the rider collected
                            it).
                          </p>
                        )}
                      </div>
                    )}

                    {next.includes("cancelled") &&
                      (confirmCancel ? (
                        <div className="flex flex-col gap-3 rounded-xl bg-danger-light p-4">
                          <label className="text-sm font-medium text-danger">
                            Reason (sent to the customer)
                            <input
                              value={reason}
                              onChange={(event) =>
                                setReason(event.target.value)
                              }
                              placeholder="e.g. Out of stock"
                              className="mt-1.5 h-11 w-full rounded-xl bg-surface px-3 text-ink outline-none focus:ring-2 focus:ring-danger/30"
                            />
                          </label>
                          <p className="text-xs text-danger">
                            The items go back in stock.{" "}
                            {order.payment.status === "paid"
                              ? `The ${naira(order.total)} card payment is marked as refunded.`
                              : "Nothing was charged."}
                          </p>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => changeStatus("cancelled")}
                              className="h-10 rounded-xl bg-danger px-4 font-semibold text-white disabled:opacity-60"
                            >
                              Yes, cancel order
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmCancel(false)}
                              className="h-10 rounded-xl px-4 font-semibold text-ink-soft hover:bg-surface"
                            >
                              Keep it
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmCancel(true)}
                          className="flex items-center gap-2 self-start text-sm font-semibold text-danger hover:underline"
                        >
                          <MdOutlineCancel size={18} aria-hidden="true" />{" "}
                          Cancel order
                        </button>
                      ))}
                  </div>
                )}
                {actionError && (
                  <p role="alert" className="mt-3 text-sm text-danger">
                    {actionError}
                  </p>
                )}
              </Box>

              <Box title="Customer">
                <p className="font-semibold text-ink">
                  {order.contact.firstName} {order.contact.lastName}
                </p>
                <a
                  href={`mailto:${order.contact.email}`}
                  className="block text-sm text-primary hover:underline"
                >
                  {order.contact.email}
                </a>
                <a
                  href={`tel:${order.contact.phone}`}
                  className="block text-sm text-ink-soft hover:underline"
                >
                  {order.contact.phone}
                </a>
                {order.user && (
                  <p className="mt-2 text-xs text-muted">
                    Customer since {shortDate(order.user.createdAt)}
                  </p>
                )}
              </Box>

              <Box title="Delivery">
                <p className="text-sm text-ink">
                  <strong className="font-semibold">
                    {order.shippingAddress.fullName}
                  </strong>{" "}
                  · {order.shippingAddress.phone}
                  <br />
                  {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state}
                </p>
                {order.shippingAddress.instructions && (
                  <p className="mt-1 text-sm text-ink-soft italic">
                    “{order.shippingAddress.instructions}”
                  </p>
                )}
                <p className="mt-2 text-sm text-ink-soft">
                  {order.deliveryMethod === "express" ? "Express" : "Standard"}{" "}
                  delivery · expected {shortDate(order.estimatedDelivery.from)}{" "}
                  – {shortDate(order.estimatedDelivery.to)}
                </p>
                {order.waybill && (
                  <p className="mt-1 text-sm text-ink-soft">
                    {order.courier} · waybill{" "}
                    <strong className="font-semibold text-ink">
                      {order.waybill}
                    </strong>
                  </p>
                )}
              </Box>

              <Box title={`Items (${order.items.length})`}>
                <ul className="divide-y divide-line">
                  {order.items.map((item) => (
                    <li
                      key={`${item.product}-${item.color ?? ""}`}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="size-12 shrink-0 rounded-lg bg-field object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">
                          {item.name}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {item.quantity} × {naira(item.price)}
                          {item.color ? ` · ${item.color}` : ""} · SKU{" "}
                          {item.sku}
                        </p>
                      </div>
                      <span className="font-semibold text-ink">
                        {naira(item.lineTotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Box>

              <Box title="Payment">
                <dl className="flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Subtotal</dt>
                    <dd>{naira(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Delivery</dt>
                    <dd>
                      {order.deliveryFee === 0
                        ? "Free"
                        : naira(order.deliveryFee)}
                    </dd>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <dt>
                        Discount{order.promoCode ? ` (${order.promoCode})` : ""}
                      </dt>
                      <dd>−{naira(order.discount)}</dd>
                    </div>
                  )}
                  <div className="mt-1 flex justify-between border-t border-line pt-2 text-base font-bold">
                    <dt>Total</dt>
                    <dd>{naira(order.total)}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm text-ink-soft">
                  {order.payment.method === "card"
                    ? `${order.payment.cardBrand ?? "Card"} ending ${order.payment.cardLast4 ?? "••••"}`
                    : "Pay on delivery"}{" "}
                  ·{" "}
                  <strong className="font-semibold text-ink capitalize">
                    {order.payment.status}
                  </strong>
                </p>
              </Box>

              <Box title="History">
                <ol className="flex flex-col gap-3">
                  {[...order.statusHistory].reverse().map((entry) => (
                    <li
                      key={entry.at + entry.status}
                      className="flex gap-3 text-sm"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                      />
                      <div>
                        <p className="font-medium text-ink">{entry.note}</p>
                        <p className="text-xs text-ink-soft">
                          {shortDateTime(entry.at)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Box>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPanel;
