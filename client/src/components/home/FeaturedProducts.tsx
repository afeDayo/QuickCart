// FeaturedProducts.tsx client/src/components/home/FeaturedProducts.tsx
// The Home page's "EDITOR'S CHOICE / Featured products" row: the 4 products tagged "featured" in the database.

// STEP 32 (part 8): The first product row

import { MdArrowForward } from "react-icons/md";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import type { ProductsResponse } from "../../types/api";
import SectionHeader from "../common/SectionHeader";
import ProductCard from "../product/ProductCard";

const FeaturedProducts = () => {
  // ?tag=featured: only products with the "featured" tag (server STEP 16)
  const { data, error, loading } = useApi<ProductsResponse>(
    "/products?tag=featured&limit=4",
  );

  // Nothing to show (an error, or no featured products): hide the whole section instead of an empty box.
  // The category row above already shows the "Try again" message if the server is off.
  if (error || (!loading && data?.products.length === 0)) {
    return null;
  }

  return (
    <section aria-labelledby="featured-title">
      <SectionHeader
        eyebrow="Editor's choice"
        title="Featured products"
        titleId="featured-title"
      >
        <Link
          to="/shop?tag=featured"
          className="flex items-center gap-1 text-sm font-semibold text-primary-hover hover:underline"
        >
          View all <MdArrowForward size={16} aria-hidden="true" />
        </Link>
      </SectionHeader>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-sm:grid-cols-2 max-sm:gap-3">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <li
                key={index}
                aria-hidden="true"
                className="h-105 animate-pulse rounded-3xl bg-surface shadow-card"
              />
            ))
          : data?.products.map((product) => (
              <li key={product._id} className="flex">
                <ProductCard product={product} />
              </li>
            ))}
      </ul>
    </section>
  );
};

export default FeaturedProducts;
