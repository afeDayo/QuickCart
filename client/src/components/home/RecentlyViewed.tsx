// RecentlyViewed.tsx client/src/components/home/RecentlyViewed.tsx
// "Recently Viewed" (Home design): the last products you opened, with "Clear History". Hidden when there are none.
// The list is in the browser (utils/recentlyViewed.ts); the Product Details page adds to it.

// STEP 35 (part 14): Recently viewed

import { useState } from "react";
import { MdHistory } from "react-icons/md";
import { Link } from "react-router-dom";
import { naira } from "../../utils/format";
import {
  clearRecentlyViewed,
  getRecentlyViewed,
} from "../../utils/recentlyViewed";

const RecentlyViewed = ({ excludeId }: { excludeId?: string }) => {
  // Read once when the section appears (useState with a function = only on the first render)
  const [items, setItems] = useState(getRecentlyViewed);
  const shown = items.filter((item) => item._id !== excludeId); // on a product page, don't show that same product

  if (shown.length === 0) return null;

  const clear = () => {
    clearRecentlyViewed();
    setItems([]);
  };

  return (
    <section
      aria-labelledby="recent-title"
      className="rounded-3xl bg-surface p-6 shadow-card"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2
          id="recent-title"
          className="flex items-center gap-2 text-xl font-semibold text-ink"
        >
          <MdHistory size={22} aria-hidden="true" className="text-ink-soft" />{" "}
          Recently Viewed
        </h2>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-muted hover:text-ink"
        >
          Clear History
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {shown.map((item) => (
          <li key={item._id}>
            <Link to={`/product/${item.slug}`} className="group block">
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="aspect-[4/3.4] w-full rounded-2xl bg-field object-cover"
              />
              <p className="mt-2 truncate text-sm font-semibold text-ink group-hover:text-primary">
                {item.name}
              </p>
              <p className="text-sm font-bold text-primary-hover">
                {naira(item.price)}
              </p>
              <span className="mt-2 block rounded-lg bg-field py-1.5 text-center text-sm font-medium text-ink transition-colors group-hover:bg-primary-light">
                View again
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RecentlyViewed;
