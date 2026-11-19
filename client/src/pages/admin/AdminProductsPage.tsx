// AdminProductsPage.tsx client/src/pages/admin/AdminProductsPage.tsx
// "Products" (design: Admin - Products Management): Add Product, the 4 stock cards, the tabs (All / In Stock /
// Low Stock / Out of Stock / Drafts), search by name or SKU, category, price and sort, 8 per page.
// GET /api/admin/products (server STEP 25). The filters live in the address bar, like the Shop page.

// STEP 42 (part 3): The admin Products page

import { useEffect, useRef, useState } from "react";
import {
  MdAddCircleOutline,
  MdCheckCircleOutline,
  MdOutlineInventory2,
  MdRemoveShoppingCart,
  MdSearch,
  MdSearchOff,
  MdWarningAmber,
} from "react-icons/md";
import { Link, useSearchParams } from "react-router-dom";
import AdminStatCard from "../../components/admin/AdminStatCard";
import ProductsTable from "../../components/admin/ProductsTable";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { useApi } from "../../hooks/useApi";
import type {
  AdminCategory,
  AdminProductsResponse,
  AdminProductTab,
} from "../../types/admin";

const PER_PAGE = 8; // "Rows per page: 8"

const TABS: { value: AdminProductTab; label: string }[] = [
  { value: "all", label: "All Products" },
  { value: "in-stock", label: "In Stock" },
  { value: "low-stock", label: "Low Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
  { value: "drafts", label: "Drafts" },
];

// "All Prices" dropdown -> minPrice / maxPrice
const PRICES: Record<string, { label: string; min?: number; max?: number }> = {
  "": { label: "All Prices" },
  under10: { label: "Under ₦10,000", max: 9999 },
  "10to50": { label: "₦10,000 – ₦50,000", min: 10000, max: 50000 },
  over50: { label: "Over ₦50,000", min: 50001 },
};

const selectClasses =
  "h-12 cursor-pointer rounded-xl bg-field px-4 font-medium text-ink outline-none focus:ring-2 focus:ring-primary/30";

const AdminProductsPage = () => {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as AdminProductTab) || "all";
  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "";
  const price = params.get("price") ?? "";
  const sort = params.get("sort") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  // Change some filters (any change except the page goes back to page 1).
  // Start from the address bar as it is right now (window.location.search), so the search box's late timer never
  // undoes a dropdown picked in the meantime. (See 42.1: setParams((current) => ...) can't promise that.)
  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (value && !(key === "tab" && value === "all")) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in changes)) next.delete("page");
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

  const query = new URLSearchParams({
    limit: String(PER_PAGE),
    page: String(page),
  });
  if (tab !== "all") query.set("tab", tab);
  if (search) query.set("search", search);
  if (category) query.set("category", category);
  if (sort) query.set("sort", sort);
  const range = PRICES[price] ?? PRICES[""];
  if (range.min !== undefined) query.set("minPrice", String(range.min));
  if (range.max !== undefined) query.set("maxPrice", String(range.max));

  const { data, error, loading, reload } = useApi<AdminProductsResponse>(
    `/admin/products?${query}`,
  );
  const { data: categoryData } = useApi<{ categories: AdminCategory[] }>(
    "/admin/categories",
  );
  const counts = data?.counts;

  const first = data ? (data.page - 1) * PER_PAGE + 1 : 0;
  const last = data ? Math.min(data.page * PER_PAGE, data.total) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-wider text-primary uppercase">
            Store catalog
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-ink">
            Products
          </h1>
          <p className="mt-2 max-w-110 text-ink-soft">
            Manage your store catalogue, stock levels and pricing.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex h-12 items-center gap-2 rounded-xl bg-primary-hover px-6 text-lg font-semibold text-white hover:bg-primary"
        >
          <MdAddCircleOutline size={22} aria-hidden="true" /> Add Product
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total items"
          value={counts?.all ?? "–"}
          icon={MdOutlineInventory2}
          note={counts ? `${counts.drafts} drafts` : undefined}
        />
        <AdminStatCard
          label="Healthy stock"
          value={counts?.["in-stock"] ?? "–"}
          icon={MdCheckCircleOutline}
          note={
            counts && counts.all > 0
              ? `${((counts["in-stock"] / counts.all) * 100).toFixed(1)}%`
              : undefined
          }
        />
        <AdminStatCard
          label="Low / Critical"
          value={counts?.["low-stock"] ?? "–"}
          icon={MdWarningAmber}
          danger
          note={
            counts &&
            counts["low-stock"] > 0 && (
              <span className="rounded-full bg-danger-light px-2 py-0.5 text-xs font-semibold text-danger">
                Action Needed
              </span>
            )
          }
        />
        <AdminStatCard
          label="Out of stock"
          value={counts?.["out-of-stock"] ?? "–"}
          icon={MdRemoveShoppingCart}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-3xl bg-surface p-5 shadow-card">
        <div
          role="tablist"
          aria-label="Filter products"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={tab === item.value}
              onClick={() => update({ tab: item.value })}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors ${
                tab === item.value
                  ? "bg-primary-hover text-white"
                  : "bg-field text-ink hover:bg-primary-light"
              }`}
            >
              {item.label}
              {counts && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    tab === item.value
                      ? "bg-white/20"
                      : item.value === "low-stock" && counts["low-stock"] > 0
                        ? "bg-danger-light text-danger"
                        : "bg-surface"
                  }`}
                >
                  {counts[item.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] max-md:grid-cols-1">
          <div className="relative">
            <label htmlFor="admin-product-search" className="sr-only">
              Search products
            </label>
            <MdSearch
              size={20}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
            />
            <input
              id="admin-product-search"
              type="search"
              value={searchText}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search products by name or SKU..."
              className="h-12 w-full rounded-xl bg-field pr-4 pl-11 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            aria-label="Category"
            value={category}
            onChange={(event) => update({ category: event.target.value })}
            className={selectClasses}
          >
            <option value="">All Categories</option>
            {categoryData?.categories.map((item) => (
              <option key={item._id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Price"
            value={price}
            onChange={(event) => update({ price: event.target.value })}
            className={selectClasses}
          >
            {Object.entries(PRICES).map(([value, option]) => (
              <option key={value} value={value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort"
            value={sort}
            onChange={(event) => update({ sort: event.target.value })}
            className={selectClasses}
          >
            <option value="">Last Updated</option>
            <option value="name">Name (A–Z)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-asc">Stock: Lowest first</option>
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
      ) : data.products.length === 0 ? (
        <EmptyState
          icon={MdSearchOff}
          title="No products found"
          text="Try another tab, category or search."
        />
      ) : (
        <section
          aria-label="Products"
          className={`overflow-hidden rounded-3xl bg-surface shadow-card ${loading ? "opacity-60" : ""}`}
        >
          <ProductsTable products={data.products} onDeleted={reload} />
          <div className="flex flex-col items-center justify-between gap-4 border-t border-line px-6 py-4 sm:flex-row">
            <p className="text-sm text-ink-soft">
              Showing {first}–{last} of {data.total} products
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
  );
};

export default AdminProductsPage;
