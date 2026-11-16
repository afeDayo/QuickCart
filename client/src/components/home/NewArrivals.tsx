// NewArrivals.tsx client/src/components/home/NewArrivals.tsx
// "JUST IN CATALOG / New Arrivals": the products tagged "new-arrival", each with a blue NEW badge.

// STEP 33 (part 7): New arrivals

import { MdOutlineVerified } from "react-icons/md";
import ProductCard from "../product/ProductCard";
import ProductSection from "./ProductSection";

const NewArrivals = () => {
  return (
    <ProductSection
      eyebrow="Just in catalog"
      eyebrowIcon={MdOutlineVerified}
      title="New Arrivals"
      titleId="new-title"
      query="tag=new-arrival&limit=4"
      link={{ to: "/shop?tag=new-arrival", label: "See all new in" }}
      renderCard={(product) => (
        <ProductCard
          product={product}
          badge={{ label: "New", className: "bg-primary text-white" }}
          details={
            <p className="text-[13px] text-muted">
              {product.tagline ?? product.brand}
            </p>
          }
        />
      )}
    />
  );
};

export default NewArrivals;
