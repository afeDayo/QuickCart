// CartProvider.tsx client/src/context/CartProvider.tsx
// Keeps the cart, and saves it in the browser (localStorage) so it survives a refresh or closing the tab.
// No login needed: anyone can fill a cart. Checkout (STEP 38) asks them to log in.

// STEP 32 (part 3): The cart provider

import { useEffect, useState, type ReactNode } from "react";
import type { ProductSummary } from "../types/api";
import { CartContext, type AddResult, type CartItem } from "./CartContext";

const CART_KEY = "quickcart_cart";
const MAX_PER_LINE = 10; // the server refuses more than 10 of one line (orderController.ts, STEP 22)

// Read the saved cart once, when the website opens. Broken or missing data -> an empty cart (never a crash).
const loadCart = (): CartItem[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart); // loadCart (no brackets): React runs it only once
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);

  // Every time the cart changes, save it
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  // These are worked out from the items every time, so they can never be out of date
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const addItem = (
    product: ProductSummary,
    { color, quantity = 1 }: { color?: string; quantity?: number } = {},
  ): AddResult => {
    const key = color ? `${product._id}:${color}` : product._id;
    const maxQuantity = Math.min(
      MAX_PER_LINE,
      product.trackStock ? product.stock : MAX_PER_LINE,
    );
    const existing = items.find((item) => item.key === key);
    const alreadyInCart = existing?.quantity ?? 0;

    if (maxQuantity <= 0) {
      return { ok: false, message: `"${product.name}" is sold out.` };
    }
    if (alreadyInCart + quantity > maxQuantity) {
      return {
        ok: false,
        message:
          maxQuantity === MAX_PER_LINE
            ? `You can add up to ${MAX_PER_LINE} of "${product.name}".`
            : `Only ${maxQuantity} of "${product.name}" left${alreadyInCart > 0 ? `, and ${alreadyInCart} already in your cart` : ""}.`,
      };
    }

    const item: CartItem = existing
      ? { ...existing, quantity: alreadyInCart + quantity, maxQuantity }
      : {
          key,
          productId: product._id,
          slug: product.slug,
          name: product.name,
          image: product.images[0] ?? "",
          price: product.price,
          oldPrice: product.oldPrice,
          color,
          quantity,
          maxQuantity,
        };

    // Already there: replace that line. New: add it at the end.
    setItems((current) =>
      existing
        ? current.map((line) => (line.key === key ? item : line))
        : [...current, item],
    );
    setLastAdded({ ...item, quantity }); // the pop-up shows how many were JUST added
    return { ok: true, item };
  };

  const updateQuantity = (key: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, item.maxQuantity)),
            }
          : item,
      ),
    );
  };

  const removeItem = (key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        lastAdded,
        dismissLastAdded: () => setLastAdded(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
