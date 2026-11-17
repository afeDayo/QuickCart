// AccountOverviewPage.tsx client/src/pages/account/AccountOverviewPage.tsx
// My Account → Overview (design: My Account & Profile Dashboard): welcome, stats, profile, recent orders,
// the default address and security. The numbers come from GET /api/orders/summary (server STEP 22).

// STEP 39 (part 13): The Overview page

import {
  MdArrowForward,
  MdOutlineLocalShipping,
  MdVerified,
} from "react-icons/md";
import { Link } from "react-router-dom";
import AccountStats from "../../components/account/AccountStats";
import ProfileCard from "../../components/account/ProfileCard";
import RecentOrderCard from "../../components/account/RecentOrderCard";
import SavedAddressCard from "../../components/account/SavedAddressCard";
import SecurityCard from "../../components/account/SecurityCard";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import type { OrderSummaryResponse } from "../../types/api";

const AccountOverviewPage = () => {
  const { user } = useAuth();
  const { data } = useApi<OrderSummaryResponse>("/orders/summary");
  if (!user) return null;

  const defaultAddress =
    user.addresses.find((address) => address.isDefault) ?? user.addresses[0];
  // "Track Active Order": the newest order that hasn't arrived yet
  const activeOrder = data?.recentOrders.find(
    (order) => order.status === "processing" || order.status === "shipped",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-surface p-6 shadow-card">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-ink">
            My Account
            {user.isEmailVerified && (
              <span className="flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
                <MdVerified size={14} aria-hidden="true" /> Verified
              </span>
            )}
          </h1>
          <p className="mt-1 text-ink-soft">
            Welcome back, {user.firstName}! Manage your profile, track
            shipments, and review your order history.
          </p>
        </div>
        {activeOrder && (
          <Link
            to={`/account/orders/${activeOrder.orderNumber}`}
            className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white hover:bg-primary-hover"
          >
            <MdOutlineLocalShipping size={18} aria-hidden="true" /> Track Active
            Order
          </Link>
        )}
      </div>

      <AccountStats
        totalOrders={data?.totalOrders ?? 0}
        inProgress={data?.inProgress ?? 0}
        delivered={data?.delivered ?? 0}
        addresses={user.addresses.length}
        defaultCity={defaultAddress?.city}
        activeOrder={activeOrder?.orderNumber}
      />

      <ProfileCard />

      <section aria-labelledby="recent-orders-title">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="recent-orders-title"
            className="flex items-center gap-2 text-2xl font-semibold text-ink"
          >
            Recent Orders
            {data && data.totalOrders > 0 && (
              <span className="rounded-full bg-field px-2 py-0.5 text-xs font-semibold text-ink-soft">
                {data.recentOrders.length} of {data.totalOrders}
              </span>
            )}
          </h2>
          {data && data.totalOrders > 0 && (
            <Link
              to="/account/orders"
              className="flex items-center gap-1 font-semibold text-primary-hover hover:underline"
            >
              View All Orders ({data.totalOrders}){" "}
              <MdArrowForward size={18} aria-hidden="true" />
            </Link>
          )}
        </div>
        {!data ? (
          <div
            aria-busy="true"
            className="h-40 animate-pulse rounded-3xl bg-surface shadow-card"
          />
        ) : data.recentOrders.length === 0 ? (
          <p className="rounded-3xl bg-surface p-6 text-ink-soft shadow-card">
            No orders yet.{" "}
            <Link
              to="/shop"
              className="font-semibold text-primary-hover hover:underline"
            >
              Start shopping
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {data.recentOrders.map((order) => (
              <RecentOrderCard key={order._id} order={order} />
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <SavedAddressCard
          address={defaultAddress}
          total={user.addresses.length}
        />
        <SecurityCard />
      </div>
    </div>
  );
};

export default AccountOverviewPage;
