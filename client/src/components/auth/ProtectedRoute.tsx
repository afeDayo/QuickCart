// ProtectedRoute.tsx client/src/components/auth/ProtectedRoute.tsx
// Wraps the routes that need a login in App.tsx:
//   <Route element={<ProtectedRoute />}>            checkout, account...  -> must be logged in
//   <Route element={<ProtectedRoute adminOnly />}>  /admin...             -> must be an admin
// It's the website's version of the server's protect and adminOnly (server STEP 18).

// STEP 31 (part 3): Protected routes

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ adminOnly = false }: { adminOnly?: boolean }) => {
  const { user, checking } = useAuth();
  const location = useLocation();

  // Still asking the server about the saved token: wait, or we'd send a logged-in user to /login by mistake
  if (checking) {
    return (
      <div
        role="status"
        className="flex min-h-[50vh] items-center justify-center"
      >
        <span className="size-8 animate-spin rounded-full border-3 border-primary-light border-t-primary" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Not logged in: go to the right login page, and remember where they wanted to go ("from").
  // After logging in, the login page sends them back there. "replace": Back doesn't loop to this page.
  if (!user) {
    return (
      <Navigate
        to={adminOnly ? "/admin/login" : "/login"}
        replace
        state={{ from: location }}
      />
    );
  }

  // A shopper trying an admin page: back to the shop. (The server refuses them too, with 403.)
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // allowed: show the page inside
};

export default ProtectedRoute;
