// CategoriesPage.tsx client/src/pages/shop/CategoriesPage.tsx
// /categories: every department as a big card. (There's no design for it, so it reuses the Home page's style.)

// STEP 34 (part 7): The Categories page

import CategoryCard from "../../components/product/CategoryCard";
import { useApi } from "../../hooks/useApi";
import type { CategoriesResponse } from "../../types/api";

const CategoriesPage = () => {
  const { data, error, loading, reload } =
    useApi<CategoriesResponse>("/categories");

  return (
    <div className="mx-auto max-w-360 px-4 pt-10 pb-20 md:px-12">
      <p className="text-[11px] font-bold tracking-wider text-primary uppercase">
        Explore departments
      </p>
      <h1 className="mt-1 text-4xl leading-11 font-extrabold tracking-tight text-ink md:text-5xl md:leading-14">
        Shop by category
      </h1>
      <p className="mt-2 mb-8 max-w-140 text-base leading-6.5 text-ink-soft">
        Everything we sell, by department. Pick one to see all its products.
      </p>

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-danger-light p-4 text-sm text-danger"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={reload}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }, (_, index) => (
                <li
                  key={index}
                  aria-hidden="true"
                  className="h-60 animate-pulse rounded-3xl bg-surface shadow-card"
                />
              ))
            : data?.categories.map((category) => (
                <li key={category._id}>
                  <CategoryCard category={category} />
                </li>
              ))}
        </ul>
      )}
    </div>
  );
};

export default CategoriesPage;
