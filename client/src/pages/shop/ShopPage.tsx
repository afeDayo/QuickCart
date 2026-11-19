// ShopPage.tsx client/src/pages/shop/ShopPage.tsx
// "Shop all products": category chips, search, category and sort dropdowns, 24 products per page. (Design: Shop)
// Every choice lives in the ADDRESS BAR (/shop?category=electronics&sort=price-asc&page=2), so:
//   - links from other pages work (the Footer, the Home rows' "View all", the Navbar search)
//   - Back and Forward undo and redo filters
//   - you can share or refresh a filtered page and get the same products

// STEP 34 (part 5): The Shop page

import { useEffect, useRef, useState } from "react";
import { MdClose, MdSearch, MdSearchOff } from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import ProductCard from "../../components/product/ProductCard";
import { useApi } from "../../hooks/useApi";
import type { CategoriesResponse, ProductsResponse } from "../../types/api";

const PER_PAGE = 24; // like the design ("Showing 1-24")

// The server's sort names (server STEP 16) and what the dropdown says
const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "best-selling", label: "Best Selling" },
];

// The Home rows link here with a tag (?tag=new-arrival): show a readable name for it
const TAG_NAMES: Record<string, string> = {
  featured: "Featured",
  "new-arrival": "New Arrivals",
  recommended: "Recommended",
  deal: "Today's Deals",
  "flash-deal": "Flash Deals",
};

const chipClasses = (active: boolean) =>
  `shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
    active
      ? "bg-primary text-white"
      : "bg-surface text-ink-soft shadow-card hover:text-primary"
  }`;

const selectClasses =
  "h-12 cursor-pointer rounded-xl bg-surface px-4 text-[15px] font-medium text-ink shadow-card outline-none focus:ring-2 focus:ring-primary/30";

const ShopPage = () => {
  const [params, setParams] = useSearchParams();

  // Read the filters from the address bar (missing = the default)
  const category = params.get("category") ?? "";
  const search = params.get("search") ?? "";
  const tag = params.get("tag") ?? "";
  const sort = params.get("sort") ?? "featured";
  const page = Math.max(1, Number(params.get("page")) || 1);

  // Start from the address bar as it is right now (window.location.search), so a late update (the search timer
  // below) never undoes a filter clicked in the meantime.
  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (value && !(key === "sort" && value === "featured"))
        next.set(key, value);
      else next.delete(key); // empty, or the default: keep the address short
    }
    if (!("page" in changes)) next.delete("page");
    setParams(next);
  };

  // The search box: typing updates the address 0.4s after you stop (debouncing, like the register email check)
  const [searchText, setSearchText] = useState(search);
  const [lastSearch, setLastSearch] = useState(search);
  if (search !== lastSearch) {
    // The search changed from OUTSIDE this box (the Navbar search, Back button): show it in the box.
    // (Setting state while rendering is React's recommended way to follow a value like this.)
    setLastSearch(search);
    setSearchText(search);
  }
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleSearchChange = (value: string) => {
    setSearchText(value);
    clearTimeout(searchTimer.current); // typed again before 0.4s: forget the previous timer
    searchTimer.current = setTimeout(
      () => update({ search: value.trim() }),
      400,
    );
  };
  // Leaving the page: cancel a waiting timer, or it would bring you back to /shop
  useEffect(() => () => clearTimeout(searchTimer.current), []);

  // The same filters, as the server's query string
  const query = new URLSearchParams({
    limit: String(PER_PAGE),
    page: String(page),
  });
  if (category) query.set("category", category);
  if (search) query.set("search", search);
  if (tag) query.set("tag", tag);
  if (sort !== "featured") query.set("sort", sort);

  const { data, error, loading, reload } = useApi<ProductsResponse>(
    `/products?${query}`,
  );
  const { data: categoryData } = useApi<CategoriesResponse>("/categories");
  const categories = categoryData?.categories ?? [];

  const currentCategory = categories.find((item) => item.slug === category);
  const title = search
    ? `Results for "${search}"`
    : currentCategory
      ? currentCategory.name
      : tag
        ? (TAG_NAMES[tag] ?? "Shop all products")
        : "Shop all products";
  const hasFilters = Boolean(category || search || tag);

  const goToPage = (next: number) => {
    update({ page: String(next) });
    window.scrollTo({ top: 0, behavior: "smooth" }); // back to the top of the new page
  };

  const first = data ? (data.page - 1) * PER_PAGE + 1 : 0;
  const last = data ? Math.min(data.page * PER_PAGE, data.total) : 0;

  return (
    <div className="mx-auto max-w-360 px-4 pt-10 pb-20 md:px-12">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="text-4xl leading-11 font-extrabold tracking-tight text-ink md:text-5xl md:leading-14">
          {title}
        </h1>

        {/* The quick chips: All + the first 6 categories (the dropdown below has all of them) */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          <button
            type="button"
            onClick={() => update({ category: "" })}
            className={chipClasses(!category)}
          >
            All
          </button>
          {categories.slice(0, 6).map((item) => (
            <button
              key={item._id}
              type="button"
              onClick={() => update({ category: item.slug })}
              className={chipClasses(category === item.slug)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <label htmlFor="shop-search" className="sr-only">
            Search products
          </label>
          <MdSearch
            size={22}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
          />
          <input
            id="shop-search"
            type="search"
            value={searchText}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search products, brands and tags..."
            className="h-12 w-full rounded-xl bg-surface pr-4 pl-12 text-[15px] text-ink shadow-card outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <label htmlFor="shop-category" className="sr-only">
          Category
        </label>
        <select
          id="shop-category"
          value={category}
          onChange={(event) => update({ category: event.target.value })}
          className={selectClasses}
        >
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item._id} value={item.slug}>
              {item.name} ({item.productCount})
            </option>
          ))}
        </select>

        <label htmlFor="shop-sort" className="sr-only">
          Sort by
        </label>
        <select
          id="shop-sort"
          value={sort}
          onChange={(event) => update({ sort: event.target.value })}
          className={selectClasses}
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* The active filters, each with an ✕ to remove it */}
      {hasFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          {[
            category && {
              key: "category",
              label: currentCategory?.name ?? category,
            },
            tag && { key: "tag", label: TAG_NAMES[tag] ?? tag },
            search && { key: "search", label: `"${search}"` },
          ]
            .filter((chip): chip is { key: string; label: string } =>
              Boolean(chip),
            )
            .map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => update({ [chip.key]: "" })}
                aria-label={`Remove filter ${chip.label}`}
                className="flex items-center gap-1 rounded-full bg-primary-light py-1 pr-2 pl-3 font-medium text-primary hover:bg-info-light"
              >
                {chip.label} <MdClose size={16} aria-hidden="true" />
              </button>
            ))}
          <button
            type="button"
            onClick={() => setParams({})}
            className="ml-1 font-semibold text-muted hover:text-ink"
          >
            Clear all
          </button>
        </div>
      )}

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-danger-light p-4 text-sm text-danger"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={reload}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : !data && loading ? (
        <ul
          aria-hidden="true"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-sm:grid-cols-2 max-sm:gap-3"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <li
              key={index}
              className="h-105 animate-pulse rounded-3xl bg-surface shadow-card"
            />
          ))}
        </ul>
      ) : data && data.products.length === 0 ? (
        <EmptyState
          icon={MdSearchOff}
          title="No products found"
          text={
            search
              ? `Nothing matches "${search}". Check the spelling, or try a shorter word.`
              : "There's nothing here yet. Try another category."
          }
          action={
            <button
              type="button"
              onClick={() => setParams({})}
              className="h-11 rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover"
            >
              Show all products
            </button>
          }
        />
      ) : (
        data && (
          <>
            {/* While new results load, the old ones stay but fade (aria-busy tells screen readers it's updating) */}
            <ul
              aria-busy={loading}
              className={`grid grid-cols-1 gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-4 max-sm:grid-cols-2 max-sm:gap-3 ${loading ? "opacity-50" : ""}`}
            >
              {data.products.map((product) => (
                <li key={product._id} className="flex">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
              <p className="text-sm text-ink-soft">
                Showing{" "}
                <strong className="text-ink">
                  {first}–{last}
                </strong>{" "}
                of <strong className="text-ink">{data.total}</strong>{" "}
                {data.total === 1 ? "item" : "items"}
              </p>
              <Pagination
                page={data.page}
                pages={data.pages}
                onChange={goToPage}
              />
            </div>
          </>
        )
      )}
    </div>
  );
};

export default ShopPage;
