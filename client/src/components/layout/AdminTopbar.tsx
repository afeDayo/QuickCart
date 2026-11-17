// AdminTopbar.tsx client/src/components/layout/AdminTopbar.tsx
// The bar across the top of the admin pages: the ☰ button for the phone menu, quick links to the shop, and who's
// logged in. (The designs show the shop's own Navbar here; a smaller admin bar keeps the admin apart from the store.)

// STEP 41 (part 4): The admin top bar

import { MdMenu, MdOutlineStorefront } from "react-icons/md";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminTopbar = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-4 border-b border-line bg-surface/90 px-4 backdrop-blur md:px-8 print:hidden">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open the admin menu"
        className="flex size-10 items-center justify-center rounded-xl bg-field text-ink lg:hidden"
      >
        <MdMenu size={22} />
      </button>

      <nav
        aria-label="Store"
        className="hidden items-center gap-6 text-[15px] font-medium text-ink-soft md:flex"
      >
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <Link to="/shop" className="hover:text-primary">
          Shop
        </Link>
        <Link to="/categories" className="hover:text-primary">
          Categories
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <Link
          to="/"
          className="hidden items-center gap-1.5 rounded-full bg-field px-4 py-2 text-sm font-semibold text-ink hover:bg-primary-light sm:flex"
        >
          <MdOutlineStorefront size={18} aria-hidden="true" /> View Store
        </Link>
        <span className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {user?.firstName[0]}
            {user?.lastName[0]}
          </span>
          <span className="hidden text-sm leading-tight sm:block">
            <span className="block font-semibold text-ink">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-muted">Administrator</span>
          </span>
        </span>
      </div>
    </header>
  );
};

export default AdminTopbar;
