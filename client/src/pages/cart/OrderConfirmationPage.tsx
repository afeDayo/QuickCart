// OrderConfirmationPage.tsx client/src/pages/cart/OrderConfirmationPage.tsx
// "Your order has been placed!" (design: Order Confirmation & Receipt). It loads the order from the server
// (GET /api/orders/:orderNumber, server STEP 22), so a refresh shows the same page, and it's always the real order.

// STEP 38 (part 13): The Order Confirmation page

import {
  MdArrowForward,
  MdCalendarToday,
  MdCheckCircle,
  MdOutlineChatBubbleOutline,
  MdOutlineEventAvailable,
  MdOutlineInventory2,
  MdOutlineLocalShipping,
  MdOutlinePlace,
  MdOutlineReceiptLong,
  MdSearchOff,
} from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";
import StepTracker from "../../components/common/StepTracker";
import OrderTracker from "../../components/order/OrderTracker";
import PriceBreakdown from "../../components/order/PriceBreakdown";
import { useApi } from "../../hooks/useApi";
import type { OrderResponse } from "../../types/api";
import { longDate, timeOnly } from "../../utils/dates";
import { naira, plural } from "../../utils/format";

const OrderConfirmationPage = () => {
  const { orderId = "" } = useParams(); // "QC-1042" (App.tsx calls it :orderId)
  const { data, error } = useApi<OrderResponse>(`/orders/${orderId}`);

  if (error) {
    return (
      <div className="mx-auto max-w-360 px-4 py-16 md:px-12">
        <EmptyState
          icon={MdSearchOff}
          title="We couldn't find that order"
          text={error}
          action={
            <Link
              to="/account/orders"
              className="flex h-11 items-center rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover"
            >
              My Orders
            </Link>
          }
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div
        aria-busy="true"
        className="mx-auto my-10 h-96 max-w-[calc(90rem-6rem)] animate-pulse rounded-3xl bg-surface shadow-card"
      />
    );
  }

  const { order, canCancel, cancelDeadline } = data;
  const address = order.shippingAddress;
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const paymentText =
    order.payment.method === "card"
      ? `Payment: Confirmed (${order.payment.cardBrand} •••• ${order.payment.cardLast4})`
      : "Payment: Pay on Delivery (cash or POS)";

  return (
    <div className="mx-auto max-w-360 px-4 pt-6 pb-20 md:px-12">
      <StepTracker current={3} />

      {/* The big "placed" banner */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-surface px-6 py-12 text-center shadow-card">
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 size-96 rounded-full bg-mint/30 blur-3xl"
        />
        <div className="relative">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-mint/40">
            <MdCheckCircle
              size={56}
              aria-hidden="true"
              className="text-success"
            />
          </span>
          <p className="mx-auto mt-5 w-fit rounded-full bg-mint/40 px-3 py-1 text-xs font-bold tracking-wider text-forest uppercase">
            Order confirmed
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            Your order has been placed!
          </h1>
          <p className="mt-3 text-lg text-ink-soft">
            Thank you {order.contact.firstName}, we have received your order and
            started preparing it for delivery.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 rounded-xl bg-primary-light/60 px-4 py-2">
              <MdOutlineReceiptLong size={18} aria-hidden="true" /> Order
              Number:{" "}
              <strong className="text-lg text-primary-hover">
                #{order.orderNumber}
              </strong>
            </span>
            <span className="flex items-center gap-1.5 rounded-xl bg-primary-light/60 px-4 py-2">
              <MdCalendarToday size={16} aria-hidden="true" /> Date:{" "}
              <span className="text-ink-soft">{longDate(order.createdAt)}</span>
            </span>
          </div>
          <p className="mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-full bg-mint/40 px-4 py-1.5 text-sm font-medium text-forest">
            <MdCheckCircle size={16} aria-hidden="true" /> {paymentText}
          </p>
          <p className="mt-4 text-sm text-muted">
            A confirmation email is on its way to {order.contact.email}.
            {canCancel &&
              ` Changed your mind? You can cancel free until ${timeOnly(cancelDeadline)} from My Orders.`}
          </p>
        </div>
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_440px]">
        <div className="flex flex-col gap-6">
          <section
            aria-labelledby="items-title"
            className="rounded-3xl bg-surface p-6 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-panel px-4 py-3">
              <h2
                id="items-title"
                className="flex items-center gap-2 text-lg font-semibold text-ink"
              >
                <MdOutlineInventory2
                  size={20}
                  aria-hidden="true"
                  className="text-primary"
                />{" "}
                Items in this order
              </h2>
              <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-sm font-semibold text-primary">
                {plural(count, "item")}
              </span>
            </div>
            <ul className="flex flex-col gap-3">
              {order.items.map((item) => (
                <li
                  key={`${item.product}-${item.color}`}
                  className="flex items-center gap-4 rounded-2xl bg-panel/60 p-4"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="size-18 shrink-0 rounded-xl bg-field object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{item.name}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                      {item.color}
                      <span className="rounded-md bg-surface px-2 py-0.5 font-semibold text-ink">
                        Qty: {item.quantity}
                      </span>
                    </p>
                  </div>
                  <p className="text-right">
                    <span className="block text-lg font-bold text-ink">
                      {naira(item.lineTotal)}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-sm text-muted">
                        {naira(item.price)} each
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <PriceBreakdown order={order} />
        </div>

        <div className="flex flex-col gap-6">
          <section
            aria-labelledby="progress-title"
            className="rounded-3xl bg-surface p-6 shadow-card"
          >
            <h2
              id="progress-title"
              className="mb-5 text-xl font-semibold text-ink"
            >
              Order Progress
            </h2>
            <OrderTracker order={order} />
          </section>

          <section
            aria-label="Delivery details"
            className="rounded-3xl bg-surface p-6 shadow-card"
          >
            <div className="mb-5 flex gap-4 rounded-2xl bg-panel p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <MdOutlineEventAvailable size={22} aria-hidden="true" />
              </span>
              <p>
                <span className="block text-xs font-bold tracking-wider text-ink-soft uppercase">
                  Estimated delivery window
                </span>
                <span className="text-xl font-bold text-primary-hover">
                  {order.estimatedDelivery.from === order.estimatedDelivery.to
                    ? longDate(order.estimatedDelivery.from)
                    : `${longDate(order.estimatedDelivery.from)} – ${longDate(order.estimatedDelivery.to)}`}
                </span>
              </p>
            </div>

            <dl className="flex flex-col gap-4 text-[15px]">
              <div className="flex gap-3">
                <MdOutlinePlace
                  size={20}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink-soft"
                />
                <div>
                  <dt className="font-semibold text-ink">Delivery Address</dt>
                  <dd className="text-ink-soft">
                    {address.fullName}
                    <br />
                    {address.street}, {address.city}, {address.state},{" "}
                    {address.country}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <MdOutlineLocalShipping
                  size={20}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink-soft"
                />
                <div>
                  <dt className="font-semibold text-ink">Shipping Method</dt>
                  <dd className="text-ink-soft">
                    {order.deliveryMethod === "express"
                      ? "Express Same-Day Dispatch (Lagos)"
                      : "Standard Doorstep Delivery"}
                  </dd>
                </div>
              </div>
              {address.instructions && (
                <div className="flex gap-3 rounded-2xl bg-panel p-3">
                  <MdOutlineChatBubbleOutline
                    size={20}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-ink-soft"
                  />
                  <div>
                    <dt className="font-semibold text-ink">
                      Delivery Instructions
                    </dt>
                    <dd className="text-ink-soft">"{address.instructions}"</dd>
                  </div>
                </div>
              )}
            </dl>

            <Link
              to="/shop"
              className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-white hover:bg-primary-hover"
            >
              Continue Shopping <MdArrowForward size={18} aria-hidden="true" />
            </Link>
            <Link
              to={`/account/orders/${order.orderNumber}`}
              className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-light/60 font-medium text-ink hover:bg-primary-light"
            >
              <MdOutlineReceiptLong size={18} aria-hidden="true" /> View Order
              Details
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
