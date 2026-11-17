// OrderHistoryPage.tsx client/src/pages/account/OrderHistoryPage.tsx
// My Account → Order History (design: Full Order History & Filters): search, sort, the tabs with their numbers, and
// every order as a card. GET /api/orders?status=&search=&sort= (server STEP 22). The filters live in the address bar,
// like the Shop page (STEP 34).

// STEP 40 (part 3): The Order History page

import { useEffect, useRef, useState } from "react";
import { MdOutlineReceiptLong, MdSearch, MdVerified } from "react-icons/md";
import { Link, useSearchParams } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";
import OrderCard from "../../components/order/OrderCard";
import { useApi } from "../../hooks/useApi";
import type { MyOrdersResponse } from "../../types/api";

// The tabs: the server's names (server STEP 22) and what they say
const TABS = [
  { value: "", label: "All Orders", count: "all" },
  { value: "in-progress", label: "In Progress", count: "in-progress" },
  { value: "shipped", label: "Shipped", count: "shipped" },
  { value: "delivered", label: "Delivered", count: "delivered" },
  { value: "cancelled", label: "Cancelled", count: "cancelled" },
] as const;

const OrderHistoryPage = () => {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "";
  const search = params.get("search") ?? "";
  const sort = params.get("sort") ?? "";

  const update = (key: string, value: string) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  // The search box waits until you stop typing (the same pattern as the Shop page, STEP 34)
  const [searchText, setSearchText] = useState(search);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleSearch = (value: string) => {
    setSearchText(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => update("search", value.trim()), 400);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (search) query.set("search", search);
  if (sort) query.set("sort", sort);
  const { data, error, loading, reload } = useApi<MyOrdersResponse>(
    `/orders?${query}`,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Order History
          </h1>
          <p className="mt-1 text-ink-soft">
            Track past packages, print invoices, and reorder your favourite
            everyday essentials.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-mint/40 px-3 py-1 text-sm font-medium text-forest">
          <MdVerified size={16} aria-hidden="true" /> Verified Local Delivery
        </span>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="order-search" className="sr-only">
              Search orders
            </label>
            <MdSearch
              size={20}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
            />
            <input
              id="order-search"
              type="search"
              value={searchText}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search by order number (e.g. #QC-1042) or product name..."
              className="h-12 w-full rounded-full bg-field pr-4 pl-11 text-[15px] outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <label className="sr-only" htmlFor="order-sort">
            Sort
          </label>
          <select
            id="order-sort"
            value={sort}
            onChange={(event) => update("sort", event.target.value)}
            className="h-12 cursor-pointer rounded-full bg-field px-5 font-medium text-ink outline-none"
          >
            <option value="">Sort: Most Recent</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>

        <div
          role="tablist"
          aria-label="Filter orders"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => update("status", tab.value)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                status === tab.value
                  ? "bg-primary text-white"
                  : "border border-line bg-surface text-ink-soft hover:text-primary"
              }`}
            >
              {tab.label} {data && `(${data.counts[tab.count]})`}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-center justify-between rounded-2xl bg-danger-light p-4 text-sm text-danger"
        >
          {error}
          <button
            type="button"
            onClick={reload}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : !data ? (
        <div
          aria-busy="true"
          className="h-64 animate-pulse rounded-3xl bg-surface shadow-card"
        />
      ) : data.orders.length === 0 ? (
        <EmptyState
          icon={MdOutlineReceiptLong}
          title={data.counts.all === 0 ? "No orders yet" : "No orders match"}
          text={
            data.counts.all === 0
              ? "When you place an order, it will appear here so you can track it."
              : "Try another tab or search."
          }
          action={
            data.counts.all === 0 && (
              <Link
                to="/shop"
                className="flex h-11 items-center rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover"
              >
                Start Shopping
              </Link>
            )
          }
        />
      ) : (
        <ul className={`flex flex-col gap-5 ${loading ? "opacity-60" : ""}`}>
          {data.orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistoryPage;
