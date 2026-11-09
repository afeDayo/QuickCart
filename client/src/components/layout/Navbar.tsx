import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/images/Link.png";
import { MdOutlineLocalMall, MdOutlinePerson, MdSearch } from "react-icons/md";

// The links in the main navigation
const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories" },
];

const Navbar = () => {
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
          <form role="search" className="relative hidden lg:block">
            <label htmlFor="header-search" className="sr-only">
              Search products, brands and categories
            </label>
            <MdSearch
              size={21}
              aria-hidden="true"
              className="pointer-events-none absolute top-3 left-3.25 text-muted"
            />
            <input
              id="header-search"
              name="search"
              type="search"
              placeholder="Search products, brands and categories..."
              className="h-12 w-83 rounded-full bg-field pr-4 pl-11.75 text-[13px] text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
            />
          </form>

          <Link
            to="/cart"
            aria-label="Cart"
            className="relative flex size-10 items-center justify-center rounded-full bg-field text-ink transition-colors hover:bg-primary-light"
          >
            <MdOutlineLocalMall size={20} aria-hidden="true" />
            <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 animate-bumb items-center justify-center rounded-full bg-danger px-1 text-xs leading-none font-bold text-white">
              1
            </span>
          </Link>

          <Link
            to="/account"
            className="flex size-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-hover"
          >
            <MdOutlinePerson size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
