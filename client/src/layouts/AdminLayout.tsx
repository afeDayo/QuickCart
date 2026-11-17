// AdminLayout.tsx client/src/layouts/AdminLayout.tsx
// The frame of every admin page (App.tsx puts them all inside it, behind ProtectedRoute adminOnly):
// the menu on the left (a slide-in drawer on phones), the top bar, and the page (<Outlet />). No shop Navbar or Footer.

// STEP 41 (part 5): The admin layout

import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar";
import AdminTopbar from "../components/layout/AdminTopbar";

const AdminLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // A new admin page starts at the top (the shop has ScrollToTop in MainLayout; the admin has its own layout)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-page lg:grid lg:grid-cols-[288px_1fr]">
      {/* Computer: the menu is always there, and stays put while the page scrolls */}
      <aside className="sticky top-0 hidden h-screen border-r border-line lg:block print:hidden">
        <AdminSidebar />
      </aside>

      {/* Phone: the same menu slides in over the page */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-label="Admin menu"
        >
          <button
            type="button"
            aria-label="Close the menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 animate-fade-in bg-ink/40"
          />
          <div className="absolute inset-y-0 left-0 w-72 animate-slide-in-left shadow-banner">
            <AdminSidebar onNavigate={() => setMenuOpen(false)} />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close the menu"
              className="absolute top-4 -right-12 flex size-10 items-center justify-center rounded-full bg-surface text-ink"
            >
              <MdClose size={22} />
            </button>
          </div>
        </div>
      )}

      <div className="min-w-0">
        <AdminTopbar onOpenMenu={() => setMenuOpen(true)} />
        <main className="px-4 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
