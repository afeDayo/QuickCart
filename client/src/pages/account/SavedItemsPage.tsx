// SavedItemsPage.tsx client/src/pages/account/SavedItemsPage.tsx
// My Account → Saved Items: the products you ♡ saved (STEP 35), from GET /api/account/saved (server STEP 20).

// STEP 39 (part 16): The Saved Items page

import { MdFavoriteBorder } from "react-icons/md";
import { Link } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";
import ProductCard from "../../components/product/ProductCard";
import SaveButton from "../../components/product/SaveButton";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import type { ProductSummary } from "../../types/api";

const SavedItemsPage = () => {
  const { user } = useAuth();
  const { data, error } = useApi<{ products: ProductSummary[] }>(
    "/account/saved",
  );

  // Un-saving (the ♡) updates user.savedItems at once, so hide those products without loading again
  const products = (data?.products ?? []).filter((product) =>
    user?.savedItems.includes(product._id),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-surface p-6 shadow-card">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Saved Items
        </h1>
        <p className="mt-1 text-ink-soft">
          Products you saved for later. They stay on your account, on every
          device.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-2xl bg-danger-light p-4 text-sm text-danger"
        >
          {error}
        </p>
      ) : !data ? (
        <div
          aria-busy="true"
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 max-sm:grid-cols-2 max-sm:gap-3"
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-105 animate-pulse rounded-3xl bg-surface shadow-card"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={MdFavoriteBorder}
          title="Nothing saved yet"
          text="Tap the ♡ on any product to keep it here for later."
          action={
            <Link
              to="/shop"
              className="flex h-11 items-center rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover"
            >
              Browse products
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 max-sm:grid-cols-2 max-sm:gap-3">
          {products.map((product) => (
            <li key={product._id} className="relative flex">
              <ProductCard product={product} />
              {/* The ♡ in the photo's corner: tap to remove it from Saved Items */}
              <div className="absolute top-6 right-6">
                <SaveButton
                  productId={product._id}
                  productName={product.name}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedItemsPage;
