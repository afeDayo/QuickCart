// BestSellers.tsx client/src/components/home/BestSellers.tsx
// "MOST WANTED / Best Sellers in Nigeria": the 4 products with the most sales (?sort=best-selling, server STEP 16),
// ranked "#1 BEST SELLER" to "#4", with the brand and "(1,420+ sold)".

// STEP 33 (part 6): Best sellers

import { MdStar, MdVerified } from "react-icons/md";
import ProductCard from "../product/ProductCard";
import ProductSection from "./ProductSection";

const BestSellers = () => {
  return (
    <ProductSection
      eyebrow="Most wanted"
      title="Best Sellers in Nigeria"
      titleId="best-title"
      query="sort=best-selling&limit=4"
      link={{ to: "/shop?sort=best-selling", label: "See leaderboard" }}
      renderCard={(product, index) => (
        <ProductCard
          product={product}
          badge={{
            label: `#${index + 1} Best seller`,
            className: "bg-warning text-white",
          }}
          details={
            <div className="flex flex-col gap-1 text-[13px]">
              <p className="flex items-center gap-1 font-medium text-success">
                <MdVerified size={15} aria-hidden="true" /> {product.brand}
              </p>
              <p className="flex items-center gap-1 text-muted">
                <MdStar size={15} aria-hidden="true" className="text-warning" />
                <span className="font-semibold text-ink">
                  {product.ratings.toFixed(1)}
                </span>
                ({product.sold.toLocaleString("en-NG")}+ sold)
              </p>
            </div>
          }
        />
      )}
    />
  );
};

export default BestSellers;
