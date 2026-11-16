// RecommendedForYou.tsx client/src/components/home/RecommendedForYou.tsx
// "TAILORED PICKS / Recommended for You": the products tagged "recommended", on a soft blue panel.

// STEP 33 (part 8): Recommended for you

import { MdAutoAwesome } from "react-icons/md";
import ProductCard from "../product/ProductCard";
import ProductSection from "./ProductSection";

const RecommendedForYou = () => {
  return (
    <ProductSection
      eyebrow="Tailored picks"
      eyebrowIcon={MdAutoAwesome}
      title="Recommended for You"
      titleId="recommended-title"
      query="tag=recommended&limit=4"
      aside={
        <p className="hidden text-[13px] text-muted sm:block">
          Picked from our customers' favourites
        </p>
      }
      className="rounded-3xl border border-line-soft bg-panel p-6"
      renderCard={(product) => <ProductCard product={product} />}
    />
  );
};

export default RecommendedForYou;
