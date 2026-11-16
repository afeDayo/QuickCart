import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/images/Link.png";
import { MdOutlineLocalMall } from "react-icons/md";
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

  return (
    <nav className="sticky top-0 z-50 bg-surface print:hidden shadow-[0_1px_3px_rgba(11,28,48,0.05)]">
      <div className="mx-auto flex max-w-360 flex-wrap items-center justify-between gap-y-3 px-4 py-3 md:px-12 lg:h-20 lg:flex-nowrap lg:py-0">
        {/* logo */}
        <Link to="/">
          <img src={logo} alt="" />
        </Link>

        {/* Main navigation */}
        <div
          aria-label="Main"
          className="order-last w-full md:order-0 md:w-auto"
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
        <div className="flex items-center gap-4">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
