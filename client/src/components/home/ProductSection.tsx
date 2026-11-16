// ProductSection.tsx client/src/components/home/ProductSection.tsx
// What every product row on the Home page has in common: the header, loading the products from the server,
// the grey boxes while loading, and hiding itself if there's nothing to show. Each row only says WHICH products
// and HOW to draw a card:
//   <ProductSection eyebrow="Just in catalog" title="New Arrivals" titleId="new-title"
//     query="tag=new-arrival&limit=4" renderCard={(product) => <ProductCard product={product} />} />

// STEP 33 (part 1): A shared product row

import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { MdArrowForward } from "react-icons/md";
import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import type { ProductSummary, ProductsResponse } from "../../types/api";
import SectionHeader from "../common/SectionHeader";

type ProductSectionProps = {
  eyebrow: string;
  eyebrowIcon?: IconType;
  title: string;
  titleId: string;
  query: string; // the part after "?" in GET /api/products?...
  link?: { to: string; label: string }; // "View all ->" on the right
  aside?: ReactNode; // anything else on the right of the header (instead of the link)
  renderCard: (product: ProductSummary, index: number) => ReactNode;
  className?: string; // e.g. a background panel for "Recommended for You"
};

const ProductSection = ({
  eyebrow,
  eyebrowIcon,
  title,
  titleId,
  query,
  link,
  aside,
  renderCard,
  className = "",
}: ProductSectionProps) => {
  const { data, error, loading } = useApi<ProductsResponse>(
    `/products?${query}`,
  );

  // An error or no products: hide the row (the categories row already shows "Try again" if the server is off)
  if (error || (!loading && !data?.products.length)) {
    return null;
  }

  return (
    <section aria-labelledby={titleId} className={className}>
      <SectionHeader
        eyebrow={eyebrow}
        eyebrowIcon={eyebrowIcon}
        title={title}
        titleId={titleId}
      >
        {aside ??
          (link && (
            <Link
              to={link.to}
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-hover hover:underline"
            >
              {link.label} <MdArrowForward size={16} aria-hidden="true" />
            </Link>
          ))}
      </SectionHeader>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <li
                key={index}
                aria-hidden="true"
                className="h-105 animate-pulse rounded-3xl bg-surface shadow-card"
              />
            ))
          : data?.products.map((product, index) => (
              <li key={product._id} className="flex">
                {renderCard(product, index)}
              </li>
            ))}
      </ul>
    </section>
  );
};

export default ProductSection;
