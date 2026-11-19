// FlashDealCard.tsx client/src/components/product/FlashDealCard.tsx
// A flash sale card: "-45% OFF", a red price, the "Claimed: 82%" bar, "Only 6 left" and a big Quick Add button.

// STEP 33 (part 3): The flash sale card

import { MdBolt, MdOutlineAddShoppingCart } from "react-icons/md";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import type { ProductSummary } from "../../types/api";
import { naira } from "../../utils/format";

const FlashDealCard = ({ product }: { product: ProductSummary }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  // -45% OFF: how much cheaper than the old price
  const percentOff = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  // "Claimed: 82%": of the units offered in the sale (flashSaleStock, server STEP 8), how many are gone.
  // 33 offered, 6 left -> 27 claimed -> 82%.
  const offered = product.flashSaleStock ?? 0;
  const claimed =
    offered > 0
      ? Math.min(100, Math.round(((offered - product.stock) / offered) * 100))
      : 0;
  const soldOut = product.trackStock && product.stock === 0;
  const fewLeft = product.stock <= 6;
  const link = `/product/${product.slug}`;

  const handleAdd = () => {
    const result = addItem(product, { color: product.colors[0]?.name });
    if (!result.ok)
      showToast({
        type: "error",
        title: "Couldn't add to cart",
        message: result.message,
      });
  };

  return (
    <article className="flex w-full flex-col rounded-3xl bg-surface p-4 shadow-card max-sm:rounded-2xl max-sm:p-2.5">
      <Link
        to={link}
        className="relative mb-4 block overflow-hidden rounded-2xl bg-field max-sm:mb-2.5 max-sm:rounded-xl"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="aspect-square w-full object-cover"
        />
        {percentOff > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-danger px-2.5 py-1 text-[11px] font-bold text-white max-sm:top-2 max-sm:left-2 max-sm:px-2 max-sm:text-[10px]">
            -{percentOff}% OFF
          </span>
        )}
        {product.tags.includes("fast-deal") && (
          <span className="absolute top-3 right-3 flex items-center gap-0.5 rounded-full bg-ink/60 px-2 py-0.5 text-[11px] font-medium text-white max-sm:hidden">
            <MdBolt size={13} aria-hidden="true" /> Fast Deal
          </span>
        )}
      </Link>

      <p className="text-[11px] font-semibold tracking-wider text-muted uppercase">
        {product.category.name}
      </p>
      <h3 className="mt-1 text-lg leading-6 font-semibold text-ink max-sm:line-clamp-2 max-sm:text-sm max-sm:leading-5">
        <Link to={link} className="hover:text-primary">
          {product.name}
        </Link>
      </h3>

      <p className="mt-1 flex items-baseline gap-2 max-sm:flex-wrap max-sm:gap-x-1.5">
        <span className="text-lg font-bold text-danger max-sm:text-base">
          {naira(product.price)}
        </span>
        {product.oldPrice && (
          <del className="text-[13px] text-muted">
            {naira(product.oldPrice)}
          </del>
        )}
      </p>

      {/* The bar: a background track, and a red part as wide as the claimed % */}
      <div
        role="progressbar"
        aria-valuenow={claimed}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Claimed"
        className="mt-3 h-2 overflow-hidden rounded-full bg-info-light"
      >
        <div
          className="h-full origin-left animate-grow-x rounded-full bg-danger"
          style={{ width: `${claimed}%` }}
        />
      </div>
      <p className="mt-1.5 flex justify-between text-xs max-sm:text-[11px]">
        <span className="text-muted">Claimed: {claimed}%</span>
        <span className="font-semibold text-danger">
          {soldOut
            ? "Sold out"
            : fewLeft
              ? `Only ${product.stock} left`
              : `${product.stock} left`}
        </span>
      </p>

      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut}
        className="mt-4 flex h-11 max-sm:mt-3 max-sm:h-10 max-sm:text-sm items-center justify-center gap-2 rounded-xl bg-navy text-base font-medium text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-line-soft disabled:text-muted"
      >
        <MdOutlineAddShoppingCart size={18} aria-hidden="true" />
        {soldOut ? "Sold out" : "Quick Add"}
      </button>
    </article>
  );
};

export default FlashDealCard;
