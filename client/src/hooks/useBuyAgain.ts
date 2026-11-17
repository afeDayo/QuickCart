// useBuyAgain.ts client/src/hooks/useBuyAgain.ts
// "Buy Again" on an old order: put its items back in the cart at TODAY's price and stock.
// An order only keeps a copy of each item (server STEP 22), so we ask the server for each product first.
//   const buyAgain = useBuyAgain();  ...  onClick={() => buyAgain(order.items)}

// STEP 40 (part 1): Buy again

import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import type { OrderItem, ProductResponse } from "../types/api";
import { api } from "../utils/api";

export const useBuyAgain = () => {
  const { addItem } = useCart();
  const { showToast } = useToast();

  return async (items: OrderItem[]) => {
    const problems: string[] = [];

    // One request per product, all at the same time. allSettled: one missing product doesn't stop the others.
    const results = await Promise.allSettled(
      items.map((item) => api<ProductResponse>(`/products/${item.product}`)),
    );

    results.forEach((result, index) => {
      const item = items[index];
      if (result.status === "rejected") {
        problems.push(`"${item.name}" is no longer available.`); // deleted, or turned into a draft by the admin
        return;
      }
      const added = addItem(result.value.product, {
        color: item.color,
        quantity: item.quantity,
      });
      if (!added.ok) problems.push(added.message); // e.g. sold out
    });

    if (problems.length > 0) {
      showToast({
        type: "error",
        title:
          problems.length === items.length
            ? "Nothing could be added"
            : "Some items weren't added",
        message: problems.join(" "),
      });
    }
    // Anything that was added opens the "Added to Cart!" box by itself (STEP 32)
  };
};
