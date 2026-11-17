// AdminBrand.tsx client/src/components/admin/AdminBrand.tsx
// The logo at the top of the admin menu: the bag icon, "QuickCart / COMMERCE OS" and the "Admin" badge.

// STEP 41 (part 2): The admin logo

import { MdOutlineLocalMall } from "react-icons/md";
import { Link } from "react-router-dom";

const AdminBrand = () => {
  return (
    <Link
      to="/admin"
      className="flex items-center gap-3"
      aria-label="QuickCart admin dashboard"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-hover text-white">
        <MdOutlineLocalMall size={24} aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block text-xl font-bold text-ink">QuickCart</span>
        <span className="block text-[11px] font-semibold tracking-[0.2em] text-ink-soft uppercase">
          Commerce OS
        </span>
      </span>
      <span className="ml-auto rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
        Admin
      </span>
    </Link>
  );
};

export default AdminBrand;
