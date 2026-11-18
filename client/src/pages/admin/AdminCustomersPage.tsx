// AdminCustomersPage.tsx client/src/pages/admin/AdminCustomersPage.tsx
// "Customers": every shopper with their orders and total spent. Search by name, email or phone; sort by newest,
// most spent, most orders or name; 10 a page; click a customer for the details panel (?customer=<id>).
// GET /api/admin/customers (server STEP 26). There's no design for this page, so it follows the Orders page.

// STEP 44 (part 3): The admin Customers page

import { useEffect, useRef, useState } from "react";
import {
  MdChevronRight,
  MdSearch,
  MdSearchOff,
  MdVerified,
} from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import CustomerPanel from "../../components/admin/CustomerPanel";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import { useApi } from "../../hooks/useApi";
import type { AdminCustomersResponse } from "../../types/admin";
import { shortDate } from "../../utils/dates";
import { naira } from "../../utils/format";

const PER_PAGE = 10;

const AdminCustomersPage = () => {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const sort = params.get("sort") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const openCustomer = params.get("customer");

  // The STEP 42.1 pattern: start from the real address bar
  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in changes) && !("customer" in changes)) next.delete("page");
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
  if (search) query.set("search", search);
  if (sort) query.set("sort", sort);
  const { data, error, loading, reload } = useApi<AdminCustomersResponse>(
    `/admin/customers?${query}`,
  );

  const first = data ? (data.page - 1) * PER_PAGE + 1 : 0;
  const last = data ? Math.min(data.page * PER_PAGE, data.total) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Customers
        </h1>
        <p className="mt-2 max-w-130 text-ink-soft">
          Everyone who has an account, with their orders and how much they've
          spent.
        </p>
      </div>

      <div className="grid gap-3 rounded-3xl bg-surface p-5 shadow-card md:grid-cols-[1fr_auto]">
        <div className="relative">
          <label htmlFor="admin-customer-search" className="sr-only">
            Search customers
          </label>
          <MdSearch
            size={20}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
          />
          <input
            id="admin-customer-search"
            type="search"
            value={searchText}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search by name, email or phone..."
            className="h-12 w-full rounded-xl bg-field pr-4 pl-11 outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          aria-label="Sort"
          value={sort}
          onChange={(event) => update({ sort: event.target.value })}
          className="h-12 cursor-pointer rounded-xl bg-field px-4 font-medium text-ink outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Newest first</option>
          <option value="spent">Most spent</option>
          <option value="orders">Most orders</option>
          <option value="name">Name (A–Z)</option>
        </select>
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
      ) : data.customers.length === 0 ? (
        <EmptyState
          icon={MdSearchOff}
          title="No customers found"
          text="Try another name, email or phone number."
        />
      ) : (
        <section
          aria-label="Customers"
          className={`overflow-hidden rounded-3xl bg-surface shadow-card ${loading ? "opacity-60" : ""}`}
        >
          {/* relative: keeps the sr-only header inside the scroll box (STEP 42) */}
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-200 text-left text-sm">
              <thead className="bg-panel text-xs font-bold tracking-wider text-ink-soft uppercase">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Customer
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Phone
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Orders
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Total spent
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Last order
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Joined
                  </th>
                  <th scope="col" className="py-3 pr-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-panel/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary-hover"
                        >
                          {`${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => update({ customer: customer._id })}
                            className="flex items-center gap-1 font-semibold text-ink hover:text-primary"
                          >
                            {customer.firstName} {customer.lastName}
                            {customer.isEmailVerified && (
                              <MdVerified
                                size={16}
                                aria-label="Email verified"
                                className="text-primary"
                              />
                            )}
                          </button>
                          <p className="text-xs text-ink-soft">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-ink-soft">
                      {customer.phone || "—"}
                    </td>
                    <td className="px-4 py-4 font-semibold text-ink">
                      {customer.orderCount}
                    </td>
                    <td className="px-4 py-4 font-bold whitespace-nowrap text-ink">
                      {naira(customer.totalSpent)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-ink-soft">
                      {customer.lastOrderAt
                        ? shortDate(customer.lastOrderAt)
                        : "No orders yet"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-ink-soft">
                      {shortDate(customer.createdAt)}
                    </td>
                    <td className="py-4 pr-4">
                      <button
                        type="button"
                        onClick={() => update({ customer: customer._id })}
                        aria-label={`View ${customer.firstName} ${customer.lastName}`}
                        className="flex size-9 items-center justify-center rounded-lg text-primary-hover hover:bg-primary-light"
                      >
                        <MdChevronRight size={22} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-line px-6 py-4 sm:flex-row">
            <p className="text-sm text-ink-soft">
              Showing {first}–{last} of {data.total} customers
            </p>
            <Pagination
              page={data.page}
              pages={data.pages}
              onChange={(next) => update({ page: String(next) })}
            />
          </div>
        </section>
      )}

      {openCustomer && (
        <CustomerPanel
          key={openCustomer}
          customerId={openCustomer}
          onClose={() => update({ customer: "" })}
        />
      )}
    </div>
  );
};

export default AdminCustomersPage;
