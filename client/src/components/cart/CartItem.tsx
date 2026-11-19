// CartItem.tsx client/src/components/cart/CartItem.tsx
// One line of the cart: photo, name, colour, unit price, the "− 2 +" stepper, the line total and Remove.

// STEP 36 (part 3): A cart line

import { MdDeleteOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import {
  useCart,
  type CartItem as CartItemType,
} from "../../context/CartContext";
import { naira } from "../../utils/format";
import QuantityStepper from "../common/QuantityStepper";

const CartItem = ({ item }: { item: CartItemType }) => {
  const { updateQuantity, removeItem } = useCart();
  const link = `/product/${item.slug}`;

  return (
    <li className="flex gap-4 rounded-3xl bg-surface p-4 shadow-card sm:gap-5 max-sm:gap-3 max-sm:p-3">
      <Link to={link} className="shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="size-24 rounded-2xl bg-field object-cover sm:size-32 max-sm:size-20"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row">
        <div className="min-w-0">
          <h2 className="text-lg leading-6 font-semibold text-ink max-sm:text-base max-sm:leading-5">
            <Link to={link} className="hover:text-primary">
              {item.name}
            </Link>
          </h2>
          {item.color && (
            <p className="mt-1 text-sm text-ink-soft">Color: {item.color}</p>
          )}
          <p className="mt-2 text-sm text-ink-soft">
            Unit Price: <span className="text-ink">{naira(item.price)}</span>
            {item.oldPrice && item.oldPrice > item.price && (
              <del className="ml-2 text-muted">{naira(item.oldPrice)}</del>
            )}
          </p>
          {item.quantity >= item.maxQuantity && (
            <p className="mt-1 text-xs font-medium text-[#8a5300]">
              {item.maxQuantity < 10
                ? `Only ${item.maxQuantity} in stock`
                : "Maximum 10 per order"}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end max-sm:flex-wrap max-sm:gap-x-3 max-sm:gap-y-2">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={item.maxQuantity}
            onChange={(quantity) => updateQuantity(item.key, quantity)}
            label={`Quantity of ${item.name}`}
          />
          <p className="text-xl font-bold text-ink max-sm:text-lg">
            {naira(item.price * item.quantity)}
          </p>
          <button
            type="button"
            onClick={() => removeItem(item.key)}
            aria-label={`Remove ${item.name} from your cart`}
            className="flex items-center gap-1 text-sm font-semibold text-danger hover:underline"
          >
            <MdDeleteOutline size={16} aria-hidden="true" /> Remove
          </button>
        </div>
      </div>
    </li>
  );
};

export default CartItem;
