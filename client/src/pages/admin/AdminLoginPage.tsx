// AdminLoginPage.tsx client/src/pages/admin/AdminLoginPage.tsx
// /admin/login: the staff sign-in, on its own page (no shop Navbar or Footer, App.tsx). It uses the same login as the
// shop (STEP 31), and only lets ADMIN accounts through. A shopper's account is logged straight out again.

// STEP 41 (part 12): The admin login page

import { useState, type FormEvent } from "react";
import {
  MdAdminPanelSettings,
  MdArrowBack,
  MdLogin,
  MdOutlineMail,
} from "react-icons/md";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  type Location,
} from "react-router-dom";
import AdminBrand from "../../components/admin/AdminBrand";
import PasswordInput from "../../components/form/PasswordInput";
import TextInput from "../../components/form/TextInput";
import { useAuth } from "../../context/AuthContext";

const AdminLoginPage = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: Location } | null)?.from?.pathname ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // An admin who's already logged in goes straight to the dashboard
  if (user?.role === "admin" && !submitting) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password)
      return setError("Please enter your email and password.");

    setError("");
    setSubmitting(true);
    try {
      const { user: loggedIn } = await login(email.trim(), password, false);
      if (loggedIn.role !== "admin") {
        // A real customer account, but not staff. (The server would refuse its admin requests with 403 anyway.)
        logout();
        setError(
          "This account doesn't have admin access. Use the shop's login instead.",
        );
        setSubmitting(false);
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 py-12">
      <div className="w-full max-w-110">
        <div className="rounded-3xl bg-surface p-8 shadow-lift">
          <AdminBrand />
          <div className="my-8 border-t border-line" />
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <MdAdminPanelSettings
              size={26}
              aria-hidden="true"
              className="text-primary"
            />{" "}
            Staff sign in
          </h1>
          <p className="mt-1 mb-6 text-ink-soft">
            Manage products, orders and customers.
          </p>

          {error && (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            <TextInput
              label="Admin Email"
              type="email"
              autoComplete="username"
              icon={MdOutlineMail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-hover font-semibold text-white hover:bg-primary disabled:opacity-60"
            >
              <MdLogin size={20} aria-hidden="true" />{" "}
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <Link
          to="/"
          className="mx-auto mt-6 flex w-fit items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <MdArrowBack size={16} aria-hidden="true" /> Back to the shop
        </Link>
      </div>
    </div>
  );
};

export default AdminLoginPage;
