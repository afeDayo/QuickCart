// recentlyViewed.ts client/src/utils/recentlyViewed.ts
// The last 6 products you opened, kept in the browser (no account needed), for "Recently Viewed" on the Home page.
// The Product Details page adds to it; the Home page reads it.

// STEP 35 (part 1): Recently viewed

import type { ProductSummary } from "../types/api";

const KEY = "quickcart_recently_viewed";
const MAX = 6;

// What we keep about each product: enough to draw a small card (the server is asked again when you open it)
export type ViewedProduct = Pick<
  ProductSummary,
  "_id" | "slug" | "name" | "price"
> & { image: string };

export const getRecentlyViewed = (): ViewedProduct[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return []; // broken data -> empty list, never a crash (like the cart)
  }
};

// Put a product at the front. Seen before? It moves to the front instead of appearing twice.
export const addRecentlyViewed = (product: ProductSummary) => {
  const item: ViewedProduct = {
    _id: product._id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images[0] ?? "",
  };
  const others = getRecentlyViewed().filter(
    (viewed) => viewed._id !== product._id,
  );
  localStorage.setItem(KEY, JSON.stringify([item, ...others].slice(0, MAX)));
};

export const clearRecentlyViewed = () => {
  localStorage.removeItem(KEY);
};
