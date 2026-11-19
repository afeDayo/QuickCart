// AccountSidebar.tsx client/src/components/layout/AccountSidebar.tsx
// The menu on the left of every My Account page: who you are, the pages (with counts), Log Out, and the help box.

// STEP 39 (part 2): The account menu

import type { IconType } from "react-icons";
import {
  MdLogout,
  MdOutlineDashboard,
  MdOutlineFavoriteBorder,
  MdOutlineLocalShipping,
  MdOutlineManageAccounts,
  MdOutlinePlace,
  MdOutlineSupportAgent,
} from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import type { OrderSummaryResponse } from "../../types/api";

const AccountSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: summary } = useApi<OrderSummaryResponse>("/orders/summary"); // for the "Order History 5" count

  if (!user) return null; // (ProtectedRoute makes sure there's always a user here)

  const links: {
    to: string;
    label: string;
    icon: IconType;
    count?: number;
    end?: boolean;
  }[] = [
    { to: "/account", label: "Overview", icon: MdOutlineDashboard, end: true },
    {
      to: "/account/orders",
      label: "Order History",
      icon: MdOutlineLocalShipping,
      count: summary?.totalOrders,
    },
    {
      to: "/account/addresses",
      label: "Delivery Addresses",
      icon: MdOutlinePlace,
      count: user.addresses.length,
    },
    {
      to: "/account/saved",
      label: "Saved Items",
      icon: MdOutlineFavoriteBorder,
      count: user.savedItems.length,
    },
    {
      to: "/account/settings",
      label: "Account Settings",
      icon: MdOutlineManageAccounts,
    },
  ];

  return (
    <aside className="flex flex-col gap-4 max-lg:gap-0">
      <div className="flex items-center gap-3 rounded-3xl bg-surface p-5 shadow-card max-lg:hidden">
        <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
          {user.firstName[0]}
          {user.lastName[0]}
          {user.isEmailVerified && (
            <span
              aria-label="Verified"
              className="absolute right-0 bottom-0 size-3.5 rounded-full border-2 border-surface bg-success"
            />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-ink">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
      </div>

      <nav
        aria-label="My Account"
        className="rounded-3xl bg-surface p-3 shadow-card max-lg:rounded-2xl max-lg:p-2"
      >
        <ul className="flex flex-col gap-1 max-lg:flex-row max-lg:overflow-x-auto">
          {links.map((link) => (
            <li key={link.to} className="max-lg:shrink-0">
              <NavLink
                to={link.to}
                end={link.end} // "end": Overview is only active on /account itself, not on /account/orders
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors max-lg:gap-2 max-lg:px-3 max-lg:py-2 max-lg:text-sm max-lg:whitespace-nowrap ${
                    isActive
                      ? "bg-primary-light/70 text-primary"
                      : "text-ink hover:bg-field"
                  }`
                }
              >
                <link.icon size={20} aria-hidden="true" />
                <span className="flex-1">{link.label}</span>
                {link.count !== undefined && link.count > 0 && (
                  <span className="rounded-full bg-field px-2 py-0.5 text-xs font-semibold text-ink-soft">
                    {link.count}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-2 border-t border-line pt-2 max-lg:hidden">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-danger hover:bg-danger-light"
          >
            <MdLogout size={20} aria-hidden="true" /> Log Out
          </button>
        </div>
      </nav>

      <div className="rounded-3xl bg-primary-light/50 p-5 max-lg:hidden">
        <p className="flex items-center gap-2 font-semibold text-primary">
          <MdOutlineSupportAgent size={20} aria-hidden="true" /> QuickSupport
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Need help with a delivery or a return? Our team is here every day.
        </p>
        <a
          href="mailto:help@quickcart.ng"
          className="mt-2 inline-block text-sm font-semibold text-primary-hover hover:underline"
        >
          Email the help desk →
        </a>
      </div>
    </aside>
  );
};

export default AccountSidebar;
