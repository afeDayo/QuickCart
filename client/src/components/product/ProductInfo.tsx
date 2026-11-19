// ProductInfo.tsx client/src/components/product/ProductInfo.tsx
// The white box on the right of the photos: category, SKU, name, stars, price, stock, description, features,
// colour, quantity, Add to Cart and Buy Now. (Design: Product Details)

// STEP 35 (part 8): The product info box

import { useState } from "react";
import {
  MdCheck,
  MdOutlineFlashOn,
  MdOutlineLocalMall,
  MdOutlineVerifiedUser,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import type { Product } from "../../types/api";
import { naira } from "../../utils/format";
import QuantityStepper from "../common/QuantityStepper";
import RatingStars from "../common/RatingStars";
import ColorSelector from "./ColorSelector";

type ProductInfoProps = {
  product: Product;
  onShowReviews: () => void; // "248 reviews" / "Write a review" open the Reviews tab below
};

const ProductInfo = ({ product, onShowReviews }: ProductInfoProps) => {
  const { addItem, items } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);

  const soldOut = product.trackStock && product.stock === 0;
  const lowStock =
    product.trackStock &&
    product.stock > 0 &&
    product.stock <= product.lowStockThreshold;
  const percentOff =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;

  // The most you can still add: the stock (and 10), minus what's already in your cart in this colour
  const key = color ? `${product._id}:${color}` : product._id;
  const inCart = items.find((item) => item.key === key)?.quantity ?? 0;
  const maxQuantity = Math.max(
    1,
    Math.min(10, product.trackStock ? product.stock : 10) - inCart,
  );

  const add = () => {
    const result = addItem(product, { color: color || undefined, quantity });
    if (!result.ok) {
      showToast({
        type: "error",
        title: "Couldn't add to cart",
        message: result.message,
      });
      return false;
    }
    setQuantity(1);
    return true;
  };

  // Buy Now = add to cart and go straight to checkout (which asks you to log in first, STEP 31)
  const buyNow = () => {
    if (add()) navigate("/checkout");
  };

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-card md:p-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-bold tracking-wide text-ink uppercase">
          {product.category.name}
        </span>
        <span className="text-sm text-muted">SKU: {product.sku}</span>
      </div>

      <h1 className="text-3xl leading-10 font-bold tracking-tight text-ink max-sm:text-2xl max-sm:leading-8">
        {product.name}
      </h1>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <RatingStars rating={product.ratings} />
        <span className="font-semibold text-ink">
          {product.ratings.toFixed(1)}
        </span>
        <span aria-hidden="true" className="text-muted">
          ·
        </span>
        <button
          type="button"
          onClick={onShowReviews}
          className="font-medium text-primary-hover hover:underline"
        >
          {product.reviewCount} reviews
        </button>
        <span aria-hidden="true" className="text-muted">
          ·
        </span>
        <button
          type="button"
          onClick={onShowReviews}
          className="text-ink-soft hover:text-primary"
        >
          Write a review
        </button>
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-3">
        <span className="text-3xl font-bold text-ink">
          {naira(product.price)}
        </span>
        {percentOff > 0 && (
          <>
            <del className="text-lg text-muted">{naira(product.oldPrice!)}</del>
            <span className="rounded-full bg-danger px-2 py-0.5 text-xs font-bold text-white">
              -{percentOff}%
            </span>
          </>
        )}
      </p>

      {/* Stock: sold out (red), only a few left (amber), or in stock (green) */}
      <p
        className={`mt-3 flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
          soldOut
            ? "bg-danger-light text-danger"
            : lowStock
              ? "bg-[#fff4e0] text-[#8a5300]"
              : "bg-mint/40 text-forest"
        }`}
      >
        <span
          aria-hidden="true"
          className={`size-2 rounded-full ${soldOut ? "bg-danger" : lowStock ? "bg-warning" : "bg-success"}`}
        />
        {soldOut
          ? "Out of stock"
          : lowStock
            ? `Only ${product.stock} left, ships within 24 hours`
            : product.trackStock
              ? `In Stock — ${product.stock} units left, ships within 24 hours`
              : "In Stock — ships within 24 hours"}
      </p>

      <p className="mt-5 text-base leading-7 text-ink-soft">
        {product.description}
      </p>

      {product.features.length > 0 && (
        <ul className="mt-4 grid gap-x-4 gap-y-1.5 border-b border-line pb-5 sm:grid-cols-2">
          {product.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-ink-soft"
            >
              <MdCheck
                size={16}
                aria-hidden="true"
                className="shrink-0 text-success"
              />{" "}
              {feature}
            </li>
          ))}
        </ul>
      )}

      {product.colors.length > 0 && (
        <div className="mt-5">
          <ColorSelector
            colors={product.colors}
            value={color}
            onChange={(name) => {
              setColor(name);
              setQuantity(1); // another colour is another cart line, with its own limit
            }}
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <QuantityStepper
          value={Math.min(quantity, maxQuantity)}
          max={maxQuantity}
          onChange={setQuantity}
          label={`Quantity of ${product.name}`}
        />
        <button
          type="button"
          onClick={add}
          disabled={soldOut}
          className="flex h-12 flex-1 max-sm:basis-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-line-soft disabled:text-muted"
        >
          <MdOutlineLocalMall size={20} aria-hidden="true" />
          {soldOut
            ? "Out of stock"
            : `Add to Cart • ${naira(product.price * Math.min(quantity, maxQuantity))}`}
        </button>
      </div>

      <button
        type="button"
        onClick={buyNow}
        disabled={soldOut}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy text-base font-semibold text-white transition-colors hover:bg-footer disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MdOutlineFlashOn size={20} aria-hidden="true" /> Buy Now
      </button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-muted">
        <MdOutlineVerifiedUser size={15} aria-hidden="true" /> Guaranteed
        authentic with official Nigerian warranty coverage
      </p>
    </div>
  );
};

export default ProductInfo;
