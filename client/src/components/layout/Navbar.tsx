import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/images/Link.png";
import { MdClose, MdMenu, MdOutlineLocalMall } from "react-icons/md";
import AccountMenu from "./AccountMenu";
import { useCart } from "../../context/CartContext";
import SearchBox from "./SearchBox";

// The links in the main navigation
const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories" },
];

const Navbar = () => {
  const { count } = useCart();

  // Phones: the links live in a menu that opens with the ☰ button.
  // It closes by itself on a new page: remember which page it was opened on, and compare.
  const { pathname } = useLocation();
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;

  return (
    <nav className="sticky top-0 z-50 bg-surface print:hidden shadow-[0_1px_3px_rgba(11,28,48,0.05)]">
      <div className="mx-auto flex max-w-360 flex-wrap items-center justify-between gap-y-3 px-4 py-3 md:px-12 lg:h-20 lg:flex-nowrap lg:py-0">
        {/* logo */}
        <Link to="/">
          <img src={logo} alt="" />
        </Link>

        {/* Main navigation (tablets and computers; phones use the ☰ menu below) */}
        <div
          aria-label="Main"
          className="order-last w-full md:order-0 md:w-auto max-md:hidden"
        >
          <ul className="flex items-center justify-center gap-4">
            {navLinks.map((link) => {
              return (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) => {
                      return isActive
                        ? "block rounded-full bg-primary-hover px-4 py-1 text-base leading-6 font-semibold text-white"
                        : "block px-4 py-1 text-[15px] leading-5 font-medium text-ink-soft transition-colors hover:text-primary";
                    }}
                  >
                    {link.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Search, cart and profile */}
        <div className="flex items-center gap-4 max-md:gap-2">
          <SearchBox />

          <Link
            to="/cart"
            aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
            className="relative flex size-10 items-center justify-center rounded-full bg-field text-ink transition-colors hover:bg-primary-light"
          >
            <MdOutlineLocalMall size={20} aria-hidden="true" />
            {/* key={count}: a new number = a new element, so the "bump" animation plays again */}
            {count > 0 && (
              <span
                key={count}
                aria-hidden="true"
                className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 animate-bumb items-center justify-center rounded-full bg-danger px-1 text-xs leading-none font-bold text-white"
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          <AccountMenu />

          {/* Phones only: opens and closes the menu with the page links */}
          <button
            type="button"
            onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close the menu" : "Open the menu"}
            className="flex size-10 items-center justify-center rounded-full bg-field text-ink transition-colors hover:bg-primary-light md:hidden"
          >
            {menuOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
          </button>
        </div>

        {/* Phones and tablets: the search box gets its own full-width row (computers have it in the row above) */}
        <div className="order-last w-full lg:hidden">
          <SearchBox wide />
        </div>
      </div>

      {/* Phones only: the page links, under the header, while the menu is open */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="animate-slide-up border-t border-line px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMenuOpenOn(null)}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                      isActive
                        ? "bg-primary-light text-primary"
                        : "text-ink hover:bg-field"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
