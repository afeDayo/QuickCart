// ProductDetailsPage.tsx client/src/pages/shop/ProductDetailsPage.tsx
// /product/wireless-noise-cancelling-headphones: everything about one product. (Design: Product Details)
// It loads GET /api/products/:idOrSlug (server STEP 16) and puts the pieces together.

// STEP 35 (part 15): The Product Details page

import { useEffect, useState } from "react";
import { MdArrowForward, MdSearchOff } from "react-icons/md";
import { Link, useLocation, useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import EmptyState from "../../components/common/EmptyState";
import SectionHeader from "../../components/common/SectionHeader";
import RecentlyViewed from "../../components/home/RecentlyViewed";
import BundleOffer from "../../components/product/BundleOffer";
import ProductCard from "../../components/product/ProductCard";
import ProductGallery from "../../components/product/ProductGallery";
import ProductHighlights from "../../components/product/ProductHighlights";
import ProductInfo from "../../components/product/ProductInfo";
import ProductTabs, {
  type TabName,
} from "../../components/product/ProductTabs";
import { useApi } from "../../hooks/useApi";
import type { ProductResponse } from "../../types/api";
import { addRecentlyViewed } from "../../utils/recentlyViewed";

const ProductDetailsPage = () => {
  // App.tsx calls it :productId, but it can be the slug or the id (the server accepts both)
  const { productId = "" } = useParams();
  const { data, error, reload } = useApi<ProductResponse>(
    `/products/${productId}`,
  );
  // "Leave Review" links (Order History, STEP 40) end with #reviews: open on the Reviews tab
  const location = useLocation();
  const firstTab: TabName = location.hash === "#reviews" ? "reviews" : "specs";
  const [tab, setTab] = useState<TabName>(firstTab);
  // Another product opened (e.g. from Related Products): back to the first tab. The page itself stays on screen
  // (only the address changed), so its state is reset by hand, the same "follow a value" pattern as the Shop search.
  const [tabFor, setTabFor] = useState(productId);
  if (tabFor !== productId) {
    setTabFor(productId);
    setTab(firstTab);
  }

  // The previous product stays in "data" while the next one loads (STEP 30): only use it if it's the one in the address
  const product =
    data && (data.product.slug === productId || data.product._id === productId)
      ? data.product
      : null;

  // When a product opens: remember it for "Recently Viewed", and show its name in the browser tab
  useEffect(() => {
    if (!product) return;
    addRecentlyViewed(product);
    document.title = `${product.name} | QuickCart`;
    return () => {
      document.title = "QuickCart | Everyday essentials, delivered fast";
    };
  }, [product]);

  // ...and scroll down to it once the product has loaded
  const loadedId = product?._id;
  useEffect(() => {
    if (loadedId && location.hash === "#reviews") {
      document
        .getElementById("product-tabs")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loadedId, location.hash]);

  const showReviews = () => {
    setTab("reviews");
    document
      .getElementById("product-tabs")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (error) {
    return (
      <div className="mx-auto max-w-360 px-4 py-16 md:px-12">
        <EmptyState
          icon={MdSearchOff}
          title={
            error === "Product not found"
              ? "We couldn't find that product"
              : "Something went wrong"
          }
          text={
            error === "Product not found"
              ? "It may have been removed, or the link is wrong."
              : error
          }
          action={
            <Link
              to="/shop"
              className="flex h-11 items-center rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover"
            >
              Browse all products
            </Link>
          }
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div
        aria-busy="true"
        className="mx-auto grid max-w-360 gap-8 px-4 py-10 md:px-12 lg:grid-cols-2"
      >
        <div className="aspect-square animate-pulse rounded-3xl bg-surface shadow-card" />
        <div className="h-140 animate-pulse rounded-3xl bg-surface shadow-card" />
      </div>
    );
  }

  return (
    // key={product._id}: opening another product (e.g. from Related Products) starts every part fresh:
    // first photo, first colour, quantity 1
    <div
      key={product._id}
      className="mx-auto flex max-w-360 flex-col gap-10 px-4 pt-8 pb-20 md:px-12"
    >
      <div>
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            {
              label: product.category.name,
              to: `/shop?category=${product.category.slug}`,
            },
            { label: product.name },
          ]}
        />
        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
          <ProductGallery product={product} />
          <ProductInfo product={product} onShowReviews={showReviews} />
        </div>
      </div>

      <ProductHighlights highlights={product.highlights} />
      <ProductTabs
        product={product}
        tab={tab}
        onTabChange={setTab}
        onReviewed={reload}
      />
      <BundleOffer product={product} />

      {product.relatedProducts.length > 0 && (
        <section aria-labelledby="related-title">
          <SectionHeader
            eyebrow="Similar gear"
            title="Related Products"
            titleId="related-title"
          >
            <Link
              to={`/shop?category=${product.category.slug}`}
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-hover hover:underline"
            >
              More in {product.category.name}{" "}
              <MdArrowForward size={16} aria-hidden="true" />
            </Link>
          </SectionHeader>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.relatedProducts.map((related) => (
              <li key={related._id} className="flex">
                <ProductCard
                  product={related}
                  details={
                    related.tagline ? (
                      <p className="text-[13px] text-muted">
                        {related.tagline}
                      </p>
                    ) : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <RecentlyViewed excludeId={product._id} />
    </div>
  );
};

export default ProductDetailsPage;
