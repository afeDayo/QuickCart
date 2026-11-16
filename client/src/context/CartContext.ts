// CartContext.ts client/src/context/CartContext.ts
// The shopping cart for the whole website:
//   const { items, count, subtotal, addItem } = useCart();
// The values come from CartProvider.tsx (wrapped around the app in main.tsx).

// STEP 32 (part 2): The cart context

import { createContext, useContext } from "react";
import type { ProductSummary } from "../types/api";

// One line in the cart. We copy what the cart page needs to show (name, photo, price), so the cart works
// without asking the server for every product. The server checks the REAL price and stock at checkout (STEP 22).
export type CartItem = {
  key: string; // product id + colour: the same product in 2 colours is 2 lines
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  color?: string; // "Midnight Black"
  quantity: number;
  maxQuantity: number; // the most this line can have (stock, and never more than 10, like the server)
};

// What addItem answers, so the button can say "Added" or show why not
export type AddResult =
  | { ok: true; item: CartItem }
  | { ok: false; message: string };

export type CartContextValue = {
  items: CartItem[];
  count: number; // all the quantities added up: the red number on the Navbar's bag
  subtotal: number;
  addItem: (
    product: ProductSummary,
    options?: { color?: string; quantity?: number },
  ) => AddResult;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void; // after an order is placed (STEP 38)
  lastAdded: CartItem | null; // shown in the "Added to Cart!" pop-up
  dismissLastAdded: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);

export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error(
      "useCart must be used inside <CartProvider> (see main.tsx)",
    );
  }
  return value;
};
