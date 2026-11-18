// adminEvents.ts client/src/utils/adminEvents.ts
// The admin menu shows "Products 40" and "Orders 4 New". When a page changes those numbers (an order shipped, a product
// added or deleted), it calls announceCountsChanged() and the menu loads its numbers again.
// (A browser "event", like a click, but one we make up ourselves: any component can listen for it.)

// STEP 43 (part 1): Tell the admin menu its numbers changed

export const COUNTS_CHANGED = "quickcart:admin-counts-changed";

export const announceCountsChanged = () => {
  window.dispatchEvent(new Event(COUNTS_CHANGED));
};
