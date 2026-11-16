// CategoryGrid client/src/components/home/CategoryGrid.tsx
// The Home page's "Shop by category" row: the 8 departments from the server, each with its icon and
// number of products. Clicking one opens the Shop page filtered to it.

// STEP 30 (part 4): The first component that uses real data

import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import type { CategoriesResponse } from "../../types/api";
import { categoryIcons, DefaultCategoryIcon } from "../../utils/categoryIcons";
import SectionHeader from "../common/SectionHeader";

const CategoryGrid = () => {
  const { data, error, loading, reload } =
    useApi<CategoriesResponse>("/categories");
  const categories = data?.categories ?? [];

  return (
    <section aria-labelledby="category-title">
      <SectionHeader
        eyebrow="Explore departments"
        title="Shop by category"
        titleId="category-title"
      >
        {categories.length > 0 && (
          <p className="text-[13px] leading-4 font-semibold text-subtle">
            {categories.length} curated departments
          </p>
        )}
      </SectionHeader>

      {/* 3 possible states: an error, loading (grey boxes), or the categories */}
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
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {loading
            ? // 8 grey boxes the same size as the cards, so the page doesn't jump when they arrive
              Array.from({ length: 8 }, (_, index) => (
                <li
                  key={index}
                  aria-hidden="true"
                  className="h-35 animate-pulse rounded-2xl bg-surface shadow-card"
                />
              ))
            : categories.map((category) => {
                // "devices" -> the devices icon (a name we don't know -> a general icon)
                const Icon =
                  categoryIcons[category.icon] ?? DefaultCategoryIcon;

                return (
                  <li key={category._id}>
                    <Link
                      to={`/shop?category=${category.slug}`}
                      className="group flex flex-col items-center rounded-2xl bg-surface px-2 pt-4 pb-4 shadow-card transition-shadow hover:shadow-md"
                    >
                      <span className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon size={26} aria-hidden="true" />
                      </span>
                      <span className="text-center text-[13px] leading-4 font-medium text-ink">
                        {category.name}
                      </span>
                      <span className="mt-0.5 text-[11px] leading-4.25 font-medium text-subtle">
                        {category.productCount}{" "}
                        {category.productCount === 1 ? "item" : "items"}
                      </span>
                    </Link>
                  </li>
                );
              })}
        </ul>
      )}
    </section>
  );
};

export default CategoryGrid;
