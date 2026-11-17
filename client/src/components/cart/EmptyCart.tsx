// EmptyCart.tsx client/src/components/cart/EmptyCart.tsx
// "Your shopping cart is empty" (design: Cart empty state): Start Shopping, Explore Trending Deals, and a few
// real categories to jump to.

// STEP 36 (part 7): The empty cart

import {
  MdOutlineLocalFireDepartment,
  MdOutlineRemoveShoppingCart,
  MdOutlineStorefront,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import type { CategoriesResponse } from "../../types/api";

const EmptyCart = () => {
  const { data } = useApi<CategoriesResponse>("/categories");

  return (
    <div className="mx-auto flex max-w-230 flex-col items-center rounded-3xl bg-surface px-6 py-14 text-center shadow-card">
      <span className="relative mb-6 flex size-28 items-center justify-center rounded-full bg-primary-light/60">
        <MdOutlineRemoveShoppingCart
          size={44}
          aria-hidden="true"
          className="text-primary"
        />
        <span
          aria-hidden="true"
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-surface text-sm font-semibold text-ink-soft shadow-card"
        >
          0
        </span>
      </span>
      <h2 className="text-3xl font-bold tracking-tight text-ink">
        Your shopping cart is empty
      </h2>
      <p className="mt-3 max-w-125 text-base leading-7 text-ink-soft">
        Looks like you haven't added anything yet. Discover our curated
        collections today and fill your cart with handpicked essentials!
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/shop"
          className="flex h-13 items-center gap-2 rounded-xl bg-primary px-7 font-semibold text-white hover:bg-primary-hover"
        >
          <MdOutlineStorefront size={20} aria-hidden="true" /> Start Shopping
        </Link>
        <Link
          to="/#flash-sale"
          className="flex h-13 items-center gap-2 rounded-xl bg-primary-light px-7 font-semibold text-ink hover:bg-info-light"
        >
          <MdOutlineLocalFireDepartment size={20} aria-hidden="true" /> Explore
          Trending Deals
        </Link>
      </div>

      {data && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="font-medium text-ink-soft">Popular categories:</span>
          {data.categories.slice(0, 4).map((category) => (
            <Link
              key={category._id}
              to={`/shop?category=${category.slug}`}
              className="rounded-full bg-field px-3 py-1 font-semibold text-ink hover:bg-primary-light"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmptyCart;
