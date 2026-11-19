// AdminDashboardPage.tsx client/src/pages/admin/AdminDashboardPage.tsx
// "Dashboard Overview" (design: Admin - Dashboard Overview): the range buttons, Export Report, the 4 cards, the sales
// chart with average order value and refund rate, recent orders, top sellers and low-stock alerts.
// Everything comes from ONE request: GET /api/admin/dashboard?range=30d (server STEP 27).

// STEP 41 (part 11): The admin Dashboard

import { useState } from "react";
import {
  MdDownload,
  MdOutlineInventory2,
  MdOutlinePayments,
  MdOutlinePeople,
  MdOutlineReceiptLong,
  MdOutlineRemoveShoppingCart,
  MdOutlineShoppingBag,
} from "react-icons/md";
import KpiCard from "../../components/admin/KpiCard";
import LowStockAlerts from "../../components/admin/LowStockAlerts";
import RecentOrdersTable from "../../components/admin/RecentOrdersTable";
import RevenueChart from "../../components/admin/RevenueChart";
import TopProducts from "../../components/admin/TopProducts";
import { useApi } from "../../hooks/useApi";
import type { DashboardRange, DashboardResponse } from "../../types/admin";
import { naira } from "../../utils/format";

const RANGES: { value: DashboardRange; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "90D" },
  { value: "year", label: "Year" },
];

// "Export Report": the chart's numbers as a CSV file Excel can open. Made in the browser, nothing sent anywhere.
const downloadCsv = (data: DashboardResponse) => {
  const rows = [
    ["Date", "Sales (NGN)", "Orders"],
    ...data.chart.map((point) => [
      point.date,
      String(point.sales),
      String(point.orders),
    ]),
  ];
  const csv = rows.map((row) => row.join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); // a temporary address for the file
  link.download = `quickcart-sales-${data.range}.csv`;
  link.click();
  URL.revokeObjectURL(link.href); // free it again
};

const AdminDashboardPage = () => {
  const [range, setRange] = useState<DashboardRange>("30d");
  const { data, error, loading, reload } = useApi<DashboardResponse>(
    `/admin/dashboard?range=${range}`,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl bg-surface p-6 shadow-card">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-4xl font-bold tracking-tight text-ink">
            Dashboard Overview
            <span className="flex items-center gap-1.5 rounded-full bg-mint/40 px-2.5 py-1 text-xs font-semibold text-forest">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-success"
              />{" "}
              Live data
            </span>
          </h1>
          <p className="mt-1 text-ink-soft">
            Store performance, sales and inventory alerts.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div
            role="group"
            aria-label="Time range"
            className="flex rounded-xl bg-field p-1"
          >
            {RANGES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                aria-pressed={range === option.value}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${range === option.value ? "bg-surface text-primary shadow-card" : "text-ink-soft hover:text-ink"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => data && downloadCsv(data)}
            disabled={!data}
            className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            <MdDownload size={18} aria-hidden="true" /> Export Report
          </button>
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
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-40 animate-pulse rounded-3xl bg-surface shadow-card"
            />
          ))}
        </div>
      ) : (
        <div
          className={`flex flex-col gap-6 transition-opacity ${loading ? "opacity-60" : ""}`}
        >
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Total Sales"
              value={naira(data.cards.totalSales)}
              icon={MdOutlinePayments}
              tile="bg-primary-light text-primary"
              change={data.cards.salesChange}
            />
            <KpiCard
              label="Total Orders"
              value={data.cards.totalOrders.toLocaleString("en-NG")}
              icon={MdOutlineShoppingBag}
              tile="bg-mint/40 text-forest"
              change={data.cards.ordersChange}
            />
            <KpiCard
              label="Catalog Products"
              value={String(data.cards.catalogProducts)}
              icon={MdOutlineInventory2}
              tile="bg-info-light text-primary"
              footer={
                <>
                  <span className="rounded-full bg-[#fff4e0] px-2 py-0.5 text-xs font-semibold text-[#8a5300]">
                    {data.cards.needsRestock} Low Stock
                  </span>{" "}
                  Needs restock
                </>
              }
            />
            <KpiCard
              label="Total Customers"
              value={data.cards.totalCustomers.toLocaleString("en-NG")}
              icon={MdOutlinePeople}
              tile="bg-primary-light text-primary"
              footer={
                <>
                  <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
                    +{data.cards.newCustomers}
                  </span>{" "}
                  new · {data.cards.subscribers} newsletter
                </>
              }
            />
          </div>

          <section
            aria-labelledby="chart-title"
            className="grid gap-6 rounded-3xl bg-surface p-6 shadow-card xl:grid-cols-[1fr_260px] max-xl:grid-cols-1"
          >
            <div className="min-w-0">
              <h2 id="chart-title" className="text-2xl font-semibold text-ink">
                Revenue &amp; Sales Performance
              </h2>
              <p className="mb-4 text-sm text-ink-soft">
                {data.range === "year" ? "Monthly" : "Daily"} sales
                {data.peak && (
                  <>
                    {" "}
                    · Peak:{" "}
                    <strong className="text-ink">{data.peak.label}</strong> (
                    {naira(data.peak.sales)})
                  </>
                )}
              </p>
              <RevenueChart chart={data.chart} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-panel p-4">
                <p className="flex items-center justify-between text-xs font-bold tracking-wider text-ink-soft uppercase">
                  Avg. order value{" "}
                  <MdOutlineReceiptLong
                    size={20}
                    aria-hidden="true"
                    className="text-primary"
                  />
                </p>
                <p className="mt-1 text-2xl font-bold text-ink">
                  {naira(data.avgOrderValue)}
                </p>
              </div>
              <div className="rounded-2xl bg-panel p-4">
                <p className="flex items-center justify-between text-xs font-bold tracking-wider text-ink-soft uppercase">
                  Refund rate{" "}
                  <MdOutlineRemoveShoppingCart
                    size={20}
                    aria-hidden="true"
                    className="text-primary"
                  />
                </p>
                <p className="mt-1 text-2xl font-bold text-ink">
                  {data.refundRate}%
                </p>
              </div>
              <div className="rounded-2xl bg-panel p-4">
                <p className="text-xs font-bold tracking-wider text-ink-soft uppercase">
                  Orders in this period
                </p>
                <p className="mt-1 text-2xl font-bold text-success">
                  {data.chart.reduce((sum, point) => sum + point.orders, 0)}
                </p>
              </div>
            </div>
          </section>

          <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px] max-xl:grid-cols-1">
            <RecentOrdersTable
              orders={data.recentOrders}
              total={data.totalOrdersAllTime}
            />
            <div className="flex flex-col gap-6">
              <TopProducts products={data.topProducts} />
              <LowStockAlerts
                items={data.lowStock}
                total={data.cards.needsRestock}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
