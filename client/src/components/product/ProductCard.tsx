// ProductCard.tsx client/src/components/product/ProductCard.tsx
// The standard product card (Home "Featured products", and the Shop page in STEP 34):
// photo with a badge, category, name, stars, price, and an "Add" button.
//   <ProductCard product={product} />

// STEP 32 (part 7): The product card

// Other Home rows change the badge and the line under the name (STEP 33):
//   <ProductCard product={product} badge={{ label: "NEW", className: "bg-primary text-white" }} details={<p>...</p>} />

import { MdOutlineImageNotSupported } from "react-icons/md";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import type { ProductSummary } from "../../types/api";
import Price from "../common/Price";
import RatingStars from "../common/RatingStars";
import type { ReactNode } from "react";

type ProductCardProps = {
  product: ProductSummary;
  badge?: { label: string; className: string }; // replaces the product's own badge, e.g. "#1 BEST SELLER" (STEP 33)
  details?: ReactNode; // replaces the stars line under the name (STEP 33)
};

// The badge colours from the design: SALE red, TOP SELLER green, anything else amber ("#4 BEST SELLER")
const badgeColor = (badge: string) =>
  badge === "SALE"
    ? "bg-danger text-white"
    : badge === "TOP SELLER"
      ? "bg-success text-white"
      : "bg-warning text-white";

const ProductCard = ({ product, badge, details }: ProductCardProps) => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const soldOut = product.trackStock && product.stock === 0;
  const link = `/product/${product.slug}`;

  // The badge to show: the one given by the row, or the product's own (SALE, TOP SELLER...), or none
  const shownBadge =
    badge ??
    (product.badge
      ? { label: product.badge, className: badgeColor(product.badge) }
      : null);

  const handleAdd = () => {
    // Quick add from a card takes the first colour. (The product page lets you choose, STEP 35.)
    const result = addItem(product, { color: product.colors[0]?.name });
    if (!result.ok) {
      showToast({
        type: "error",
        title: "Couldn't add to cart",
        message: result.message,
      });
    }
    // When it works, the "Added to Cart!" pop-up opens by itself (it watches lastAdded in the cart)
  };

  return (
    <article className="group flex w-full flex-col rounded-3xl bg-surface p-3 shadow-card transition-shadow hover:shadow-lift max-sm:rounded-2xl max-sm:p-2">
      <Link
        to={link}
        className="relative mb-4 block overflow-hidden rounded-2xl bg-field max-sm:mb-2.5 max-sm:rounded-xl"
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy" // the browser only downloads it when it's about to scroll into view
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex aspect-square items-center justify-center text-muted">
            <MdOutlineImageNotSupported size={40} aria-label="No photo yet" />
          </span>
        )}

        {shownBadge && (
          <span
            className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] leading-3.5 font-bold uppercase max-sm:top-2 max-sm:left-2 max-sm:px-2 max-sm:text-[10px] ${shownBadge.className}`}
          >
            {shownBadge.label}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1 pb-1">
        <p className="text-[11px] leading-4 font-semibold tracking-wider text-muted uppercase">
          {product.category.name}
        </p>

        <h3 className="mt-1 text-base leading-5.5 font-semibold text-ink max-sm:line-clamp-2 max-sm:text-sm max-sm:leading-5">
          {/* The link covers the name only, so the Add button isn't inside a link */}
          <Link to={link} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <div className="mt-1.5">
          {details ?? (
            <RatingStars
              rating={product.ratings}
              count={product.reviewCount}
              size={15}
            />
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3 max-sm:flex-col max-sm:items-stretch">
          <Price price={product.price} oldPrice={product.oldPrice} />
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={
              soldOut
                ? `${product.name} is sold out`
                : `Add ${product.name} to cart`
            }
            className="h-9 shrink-0 max-sm:w-full rounded-full bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-line-soft disabled:text-muted"
          >
            {soldOut ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
