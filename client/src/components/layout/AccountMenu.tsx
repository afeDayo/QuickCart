// AccountMenu.tsx client/src/components/layout/AccountMenu.tsx
// The round profile button at the right of the Navbar.
// Logged out: it goes to /login. Logged in: it shows your initials and opens a small menu.

// STEP 31 (part 7): The account menu

import { useEffect, useRef, useState } from "react";
import {
  MdLogout,
  MdOutlineDashboard,
  MdOutlinePerson,
  MdOutlineReceiptLong,
} from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const itemClasses =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-field";

const AccountMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when you click anywhere else, or press Escape
  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        to="/login"
        aria-label="Log in"
        className="flex size-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover"
      >
        <MdOutlinePerson size={16} aria-hidden="true" />
      </Link>
    );
  }

  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase(); // "Ada Obi" -> "AO"

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/");
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.firstName}`}
        className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white transition-colors hover:bg-primary-hover"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-11 right-0 z-50 w-60 animate-pop-in rounded-2xl bg-surface p-2 shadow-lift"
        >
          <div className="border-b border-line px-3 pt-2 pb-3">
            <p className="text-sm font-semibold text-ink">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>

          <div className="flex flex-col pt-2">
            {user.role === "admin" && (
              <Link
                role="menuitem"
                to="/admin"
                onClick={() => setOpen(false)}
                className={itemClasses}
              >
                <MdOutlineDashboard size={18} aria-hidden="true" /> Admin
                dashboard
              </Link>
            )}
            <Link
              role="menuitem"
              to="/account"
              onClick={() => setOpen(false)}
              className={itemClasses}
            >
              <MdOutlinePerson size={18} aria-hidden="true" /> My Account
            </Link>
            <Link
              role="menuitem"
              to="/account/orders"
              onClick={() => setOpen(false)}
              className={itemClasses}
            >
              <MdOutlineReceiptLong size={18} aria-hidden="true" /> My Orders
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className={`${itemClasses} text-danger`}
            >
              <MdLogout size={18} aria-hidden="true" /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
