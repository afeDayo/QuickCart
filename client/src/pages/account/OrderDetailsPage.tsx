// OrderDetailsPage.tsx client/src/pages/account/OrderDetailsPage.tsx
// /account/orders/QC-1042 (design: Order Details & Shipment Tracking): everything about one of your orders, the live
// tracker, and Cancel within the hour. GET /api/orders/:orderNumber (server STEP 22) answers with the order AND
// canCancel / cancelDeadline. Full width (App.tsx puts it outside the account menu, like the design).

// STEP 40 (part 9): The Order Details page

import {
  MdArrowBack,
  MdOutlinePrint,
  MdOutlineReplay,
  MdOutlineSupportAgent,
  MdSchedule,
  MdSearchOff,
} from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import EmptyState from "../../components/common/EmptyState";
import StatusPill from "../../components/common/StatusPill";
import CancelOrderPanel from "../../components/order/CancelOrderPanel";
import DeliveryDestination from "../../components/order/DeliveryDestination";
import PackageContents from "../../components/order/PackageContents";
import PaymentInfo from "../../components/order/PaymentInfo";
import PriceBreakdown from "../../components/order/PriceBreakdown";
import ShipmentTracker from "../../components/order/ShipmentTracker";
import { useApi } from "../../hooks/useApi";
import { useBuyAgain } from "../../hooks/useBuyAgain";
import type { OrderResponse } from "../../types/api";
import { longDate, timeOnly } from "../../utils/dates";

const OrderDetailsPage = () => {
  const { orderId = "" } = useParams();
  const { data, error, reload } = useApi<OrderResponse>(`/orders/${orderId}`);
  const buyAgain = useBuyAgain();

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
              Back to My Orders
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

  return (
    <div className="mx-auto max-w-360 px-4 pt-6 pb-20 md:px-12">
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "My Account", to: "/account" },
          { label: "Order History", to: "/account/orders" },
          { label: `#${order.orderNumber}` },
        ]}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-surface p-6 shadow-card">
        <div>
          <p className="mb-2 flex items-center gap-3 text-sm">
            <Link
              to="/account/orders"
              className="flex items-center gap-1 font-medium text-primary-hover hover:underline print:hidden"
            >
              <MdArrowBack size={16} aria-hidden="true" /> Back to My Orders
            </Link>
            <StatusPill status={order.status} />
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Order #{order.orderNumber}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-ink-soft">
            <MdSchedule size={16} aria-hidden="true" /> Placed on{" "}
            {longDate(order.createdAt)} at {timeOnly(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 print:hidden">
          {/* The browser's own print window, which can also "Save as PDF". The Navbar and Footer hide themselves (print:hidden). */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-11 items-center gap-2 rounded-xl bg-field px-4 font-semibold text-ink hover:bg-primary-light"
          >
            <MdOutlinePrint size={18} aria-hidden="true" /> Print Invoice
          </button>
          <a
            href={`mailto:help@quickcart.ng?subject=${encodeURIComponent(`Help with order #${order.orderNumber}`)}`}
            className="flex h-11 items-center gap-2 rounded-xl bg-primary-light px-4 font-semibold text-ink hover:bg-info-light"
          >
            <MdOutlineSupportAgent size={18} aria-hidden="true" /> Need Help?
          </a>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_440px]">
        <div className="flex flex-col gap-6">
          <ShipmentTracker order={order} />
          <PackageContents order={order} />
        </div>

        <div className="flex flex-col gap-6">
          <DeliveryDestination order={order} />
          <PaymentInfo order={order} />
          <PriceBreakdown order={order} />

          <div className="flex flex-col gap-4 print:hidden">
            {order.status !== "processing" && (
              <button
                type="button"
                onClick={() => buyAgain(order.items)}
                className="flex h-13 items-center justify-center gap-2 rounded-xl bg-success text-lg font-semibold text-white hover:bg-forest"
              >
                <MdOutlineReplay size={20} aria-hidden="true" /> Buy Again
              </button>
            )}
            {canCancel && (
              <CancelOrderPanel
                orderNumber={order.orderNumber}
                deadline={cancelDeadline}
                onCancelled={reload}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
