// AdminOrdersPage.tsx client/src/pages/admin/AdminOrdersPage.tsx
// "Orders Management" (design: Admin - Orders Management): Export CSV, Print Manifest, the 5 cards, the tabs
// (All / Processing / Shipped / Delivered / Cancelled), search, payment, date and courier filters, 10 orders a page,
// and the order panel (?order=QC-1048 in the address, so Back closes it and the link can be shared).
// GET /api/admin/orders (server STEP 26).

// STEP 43 (part 5): The admin Orders page

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  MdCheckCircleOutline,
  MdDownload,
  MdLocalShipping,
  MdOutlineCancel,
  MdOutlineInventory,
  MdOutlineReceiptLong,
  MdPrint,
  MdSearch,
  MdSearchOff,
} from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import AdminStatCard from "../../components/admin/AdminStatCard";
import DispatchManifest from "../../components/admin/DispatchManifest";
import OrderPanel from "../../components/admin/OrderPanel";
import OrdersTables from "../../components/admin/OrdersTables";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import type {
  AdminOrderRow,
  AdminOrdersResponse,
  AdminOrderTab,
} from "../../types/admin";
import { api } from "../../utils/api";
import { naira } from "../../utils/format";

const PER_PAGE = 10; // "Showing 1 - 10 of 1,248 orders"

const TABS: { value: AdminOrderTab; label: string }[] = [
  { value: "all", label: "All Orders" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const selectClasses =
  "h-12 cursor-pointer rounded-xl bg-field px-4 font-medium text-ink outline-none focus:ring-2 focus:ring-primary/30";

// "₦18,420,500" -> "₦18.4M", so it fits on the small cards
const shortNaira = (amount: number) =>
  amount >= 1_000_000
    ? `₦${(amount / 1_000_000).toFixed(1)}M`
    : amount >= 1000
      ? `₦${Math.round(amount / 1000)}K`
      : naira(amount);

// One CSV cell: wrapped in quotes, with any quote inside doubled ("Ada ""the boss"" Obi")
const cell = (value: string | number) =>
  `"${String(value).replace(/"/g, '""')}"`;

const AdminOrdersPage = () => {
  const { showToast } = useToast();
  const [params, setParams] = useSearchParams();
  const tab = (params.get("status") as AdminOrderTab) || "all";
  const search = params.get("search") ?? "";
  const payment = params.get("payment") ?? "";
  const days = params.get("days") ?? "";
  const courier = params.get("courier") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const openOrder = params.get("order"); // the order in the panel, or null

  // From the address bar as it is right now (the STEP 42.1 lesson). A filter goes back to page 1;
  // opening or closing the panel doesn't.
  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (value && !(key === "status" && value === "all")) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in changes) && !("order" in changes)) next.delete("page");
    setParams(next);
  };

  const [searchText, setSearchText] = useState(search);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleSearch = (value: string) => {
    setSearchText(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => update({ search: value.trim() }), 400);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  // The filters, as the server wants them (also used by Export CSV)
  const filters = new URLSearchParams();
  if (tab !== "all") filters.set("status", tab);
  if (search) filters.set("search", search);
  if (payment) filters.set("payment", payment);
  if (days) filters.set("days", days);
  if (courier) filters.set("courier", courier);

  const { data, error, loading, reload } = useApi<AdminOrdersResponse>(
    `/admin/orders?${filters}&limit=${PER_PAGE}&page=${page}`,
  );
  const counts = data?.counts;

  // Export CSV: up to 100 orders matching the filters (the server's largest page), made into a file in the browser
  const exportCsv = async () => {
    try {
      const { orders } = await api<AdminOrdersResponse>(
        `/admin/orders?${filters}&limit=100`,
      );
      const header = [
        "Order",
        "Date",
        "Customer",
        "Email",
        "City",
        "State",
        "Items",
        "Total",
        "Payment",
        "Payment status",
        "Status",
        "Courier",
        "Waybill",
      ];
      const rows = orders.map((order) => [
        order.orderNumber,
        order.createdAt.slice(0, 10),
        `${order.contact.firstName} ${order.contact.lastName}`,
        order.contact.email,
        order.shippingAddress.city,
        order.shippingAddress.state,
        order.items.reduce((sum, item) => sum + item.quantity, 0),
        order.total,
        order.payment.method === "card" ? "Card" : "Pay on delivery",
        order.payment.status,
        order.status,
        order.courier ?? "",
        order.waybill ?? "",
      ]);
      const csv = [header, ...rows]
        .map((row) => row.map(cell).join(","))
        .join("\n");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      link.download = `quickcart-orders-${tab}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't export the orders",
        message: (err as Error).message,
      });
    }
  };

  // Print Manifest: load the orders waiting to ship, put them in <DispatchManifest>, then print.
  // flushSync makes React draw the manifest NOW, before window.print() takes its picture of the page.
  const [manifest, setManifest] = useState<{
    orders: AdminOrderRow[];
    printedAt: string;
  } | null>(null);
  const printManifest = async () => {
    try {
      const { orders } = await api<AdminOrdersResponse>(
        "/admin/orders?status=processing&limit=100",
      );
      flushSync(() =>
        setManifest({ orders, printedAt: new Date().toISOString() }),
      );
      window.print();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't load the manifest",
        message: (err as Error).message,
      });
    }
  };

  const first = data ? (data.page - 1) * PER_PAGE + 1 : 0;
  const last = data ? Math.min(data.page * PER_PAGE, data.total) : 0;

  return (
    <>
      {manifest && (
        <DispatchManifest
          orders={manifest.orders}
          printedAt={manifest.printedAt}
        />
      )}

      <div className="flex flex-col gap-6 print:hidden">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Orders Management
            </h1>
            <p className="mt-2 max-w-130 text-ink-soft">
              Follow customer orders from payment to delivery: ship them, mark
              them delivered, or cancel them.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportCsv}
              className="flex h-12 items-center gap-2 rounded-xl bg-surface px-4 font-semibold text-ink shadow-card hover:text-primary"
            >
              <MdDownload size={20} aria-hidden="true" /> Export CSV
            </button>
            <button
              type="button"
              onClick={printManifest}
              className="flex h-12 items-center gap-2 rounded-xl bg-primary-hover px-5 font-semibold text-white hover:bg-primary"
            >
              <MdPrint size={20} aria-hidden="true" /> Print Manifest
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <AdminStatCard
            label="Total orders"
            value={counts?.all ?? "–"}
            icon={MdOutlineReceiptLong}
            note={data ? `${shortNaira(data.sales)} sales` : undefined}
          />
          <AdminStatCard
            label="Processing"
            value={counts?.processing ?? "–"}
            icon={MdOutlineInventory}
            note={
              counts &&
              counts.processing > 0 && (
                <span className="rounded-full bg-[#fff4e0] px-2 py-0.5 text-xs font-semibold text-[#8a5300]">
                  To ship
                </span>
              )
            }
          />
          <AdminStatCard
            label="In transit"
            value={counts?.shipped ?? "–"}
            icon={MdLocalShipping}
            note={data ? `${data.couriers.length} couriers` : undefined}
          />
          <AdminStatCard
            label="Delivered"
            value={counts?.delivered ?? "–"}
            icon={MdCheckCircleOutline}
            note={
              counts && counts.all > 0
                ? `${((counts.delivered / counts.all) * 100).toFixed(1)}%`
                : undefined
            }
          />
          <AdminStatCard
            label="Cancelled"
            value={counts?.cancelled ?? "–"}
            icon={MdOutlineCancel}
            note={data ? `${shortNaira(data.refunded)} value` : undefined}
          />
        </div>

        <div className="flex flex-col gap-4 rounded-3xl bg-surface p-5 shadow-card">
          <div
            role="tablist"
            aria-label="Filter orders"
            className="flex gap-2 overflow-x-auto pb-1"
          >
            {TABS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={tab === item.value}
                onClick={() => update({ status: item.value })}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors ${
                  tab === item.value
                    ? "bg-primary-hover text-white"
                    : "bg-field text-ink hover:bg-primary-light"
                }`}
              >
                {item.label}
                {counts && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tab === item.value ? "bg-white/20" : "bg-surface"}`}
                  >
                    {counts[item.value]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <label htmlFor="admin-order-search" className="sr-only">
                Search orders
              </label>
              <MdSearch
                size={20}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
              />
              <input
                id="admin-order-search"
                type="search"
                value={searchText}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search by order ID, customer name, email or waybill..."
                className="h-12 w-full rounded-xl bg-field pr-4 pl-11 outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              aria-label="Payment"
              value={payment}
              onChange={(event) => update({ payment: event.target.value })}
              className={selectClasses}
            >
              <option value="">Payment: All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending (pay on delivery)</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              aria-label="Date"
              value={days}
              onChange={(event) => update({ days: event.target.value })}
              className={selectClasses}
            >
              <option value="">Date: All time</option>
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <select
              aria-label="Courier"
              value={courier}
              onChange={(event) => update({ courier: event.target.value })}
              className={selectClasses}
            >
              <option value="">Courier: All</option>
              {data?.couriers.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
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
            className="h-96 animate-pulse rounded-3xl bg-surface shadow-card"
          />
        ) : data.orders.length === 0 ? (
          <EmptyState
            icon={MdSearchOff}
            title="No orders found"
            text="Try another tab, filter or search."
          />
        ) : (
          <section
            aria-label="Orders"
            className={`overflow-hidden rounded-3xl bg-surface shadow-card ${loading ? "opacity-60" : ""}`}
          >
            <OrdersTables
              orders={data.orders}
              onOpen={(orderNumber) => update({ order: orderNumber })}
            />
            <div className="flex flex-col items-center justify-between gap-4 border-t border-line px-6 py-4 sm:flex-row">
              <p className="text-sm text-ink-soft">
                Showing {first}–{last} of {data.total} orders
              </p>
              <Pagination
                page={data.page}
                pages={data.pages}
                onChange={(next) => update({ page: String(next) })}
              />
            </div>
          </section>
        )}
      </div>

      {/* key: another order = a fresh panel (its courier box, cancel reason... start empty) */}
      {openOrder && (
        <OrderPanel
          key={openOrder}
          orderNumber={openOrder}
          onClose={() => update({ order: "" })}
          onChanged={reload}
        />
      )}
    </>
  );
};

export default AdminOrdersPage;
