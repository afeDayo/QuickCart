// App.tsx client/src/App.tsx
// Every page of the website and its address. The shop pages share MainLayout (Navbar + Footer), the account pages
// AccountLayout, the admin pages AdminLayout.

// STEP 45 (part 6): The help pages get their routes, and the admin pages load only when an admin opens them

import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import ShopPage from "./pages/shop/ShopPage";
import CategoriesPage from "./pages/shop/CategoriesPage";
import ProductDetailsPage from "./pages/shop/ProductDetailsPage";
import CartPage from "./pages/cart/CartPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import CheckoutPage from "./pages/cart/CheckoutPage";
import OrderConfirmationPage from "./pages/cart/OrderConfirmationPage";
import OrderHistoryPage from "./pages/account/OrderHistoryPage";
import AddressesPage from "./pages/account/AddressesPage";
import SavedItemsPage from "./pages/account/SavedItemsPage";
import AccountSettingsPage from "./pages/account/AccountSettingsPage";
import OrderDetailsPage from "./pages/account/OrderDetailsPage";
import InfoPage from "./pages/InfoPages";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import MainLayout from "./layouts/MainLayout";
import AccountLayout from "./layouts/AccountLayout";
import AdminLayout from "./layouts/AdminLayout";
import AccountOverviewPage from "./pages/account/AccountOverviewPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { infoPages } from "./utils/InfoPages";

// The admin pages are "lazy": their code (and Chart.js, the biggest library) is downloaded only when an admin opens
// one, so shoppers get a smaller, faster website. AdminLayout shows a placeholder while a page downloads (<Suspense>).
const AdminDashboardPage = lazy(
  () => import("./pages/admin/AdminDashboardPage"),
);
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminProductsFormPage = lazy(
  () => import("./pages/admin/AdminProductsFormPage"),
);
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminCustomersPage = lazy(
  () => import("./pages/admin/AdminCustomersPage"),
);
const AdminCategoriesPage = lazy(
  () => import("./pages/admin/AdminCategoriesPage"),
);
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Everyone can access these pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/product/:productId" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          {/* Pages that need a login: shoppers who are not logged in are sent to /login first */}
          <Route element={<ProtectedRoute />}>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route
              path="/order-confirmation/:orderId"
              element={<OrderConfirmationPage />}
            />

            {/* Account pages: account menu on the left */}
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<AccountOverviewPage />} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="saved" element={<SavedItemsPage />} />
              <Route path="settings" element={<AccountSettingsPage />} />
            </Route>

            {/* Order details is full width in the design, so it has no account menu */}
            <Route
              path="/account/orders/:orderId"
              element={<OrderDetailsPage />}
            />
          </Route>

          {/* Shipping, returns, FAQs, About, Terms, Privacy... (one route each, all using InfoPage) */}
          {infoPages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={<InfoPage page={page} />}
            />
          ))}

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin login: no layout */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin pages: admin menu + top bar, no store header or footer. Only admins get in. */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductsFormPage />} />
            <Route
              path="products/:productId/edit"
              element={<AdminProductsFormPage />}
            />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />

            {/* Any other admin address shows the 404 page inside the admin layout */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
