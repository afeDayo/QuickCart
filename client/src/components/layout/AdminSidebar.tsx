// AdminSidebar.tsx client/src/components/layout/AdminSidebar.tsx
// The admin menu (designs: every Admin screen): MAIN MANAGEMENT · Dashboard, Products (40), Orders (4 New),
// Customers, Categories, Settings, and at the bottom the store status, View Store and Log Out.

// STEP 41 (part 3): The admin menu

import type { IconType } from "react-icons";
import {
  MdLogout,
  MdOutlineCategory,
  MdOutlineDashboard,
  MdOutlineInventory2,
  MdOutlineLocalShipping,
  MdOutlinePeople,
  MdOutlineSettings,
  MdOutlineStorefront,
} from "react-icons/md";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import type { AdminOrderCounts } from "../../types/admin";
import AdminBrand from "../admin/AdminBrand";
import { useEffect, useState } from "react";
import { COUNTS_CHANGED } from "../../utils/adminEvents";

type AdminSidebarProps = { onNavigate?: () => void }; // the phone menu closes itself after a click

const AdminSidebar = ({ onNavigate }: AdminSidebarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // When a page announces "the numbers changed" (utils/adminEvents.ts), add 1 to version. A new version = a new path
  // = useApi loads again. (The server ignores the extra ?v=.)
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((current) => current + 1);
    window.addEventListener(COUNTS_CHANGED, bump);
    return () => window.removeEventListener(COUNTS_CHANGED, bump);
  }, []);

  // The numbers next to Products and Orders: limit=1 asks for the counts without the whole list
  const products = useApi<{ total: number }>(
    `/admin/products?limit=1&v=${version}`,
  );
  const orders = useApi<{ counts: AdminOrderCounts }>(
    `/admin/orders?limit=1&v=${version}`,
  );

  const links: {
    to: string;
    label: string;
    icon: IconType;
    badge?: string;
    badgeClass?: string;
    end?: boolean;
  }[] = [
    { to: "/admin", label: "Dashboard", icon: MdOutlineDashboard, end: true },
    {
      to: "/admin/products",
      label: "Products",
      icon: MdOutlineInventory2,
      badge: products.data ? String(products.data.total) : undefined,
    },
    {
      to: "/admin/orders",
      label: "Orders",
      icon: MdOutlineLocalShipping,
      // "New" = waiting to be shipped (processing)
      badge: orders.data?.counts.processing
        ? `${orders.data.counts.processing} New`
        : undefined,
      badgeClass: "bg-success text-white",
    },
    { to: "/admin/customers", label: "Customers", icon: MdOutlinePeople },
    { to: "/admin/categories", label: "Categories", icon: MdOutlineCategory },
    { to: "/admin/settings", label: "Settings", icon: MdOutlineSettings },
  ];

  return (
    <div className="flex h-full flex-col bg-surface p-5">
      <AdminBrand />

      <nav aria-label="Admin" className="mt-8 flex-1">
        <p className="mb-3 px-3 text-xs font-bold tracking-wider text-ink-soft uppercase">
          Main management
        </p>
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${
                    isActive
                      ? "bg-primary-hover text-white"
                      : "text-ink hover:bg-field"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon size={20} aria-hidden="true" />
                    <span className="flex-1">{link.label}</span>
                    {link.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : (link.badgeClass ?? "bg-field text-ink-soft")
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 border-t border-line pt-5">
        <p className="rounded-2xl bg-primary-light/50 p-4 text-sm text-ink-soft">
          <span className="flex items-center gap-2 font-semibold text-ink">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-success"
            />{" "}
            Live Store
          </span>
          Changes you make here show in the shop straight away.
        </p>
        <div className="mt-4 flex items-center justify-between px-1 text-sm font-medium">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-ink-soft hover:text-ink"
          >
            <MdOutlineStorefront size={18} aria-hidden="true" /> View Store
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
            className="flex items-center gap-1.5 text-ink-soft hover:text-danger"
          >
            <MdLogout size={18} aria-hidden="true" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
