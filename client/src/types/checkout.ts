// checkout.ts client/src/types/checkout.ts
// Everything the checkout form holds, in one object. The page owns it; each section shows and changes its part.

// STEP 38 (part 2): The checkout form's shape

export type CheckoutForm = {
  // 1. Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // 2. Address: a saved address's _id, or "new" to type one
  addressId: string;
  street: string;
  city: string;
  state: string;
  instructions: string;
  // 3. Delivery
  deliveryMethod: "standard" | "express";
  // 4. Payment
  paymentMethod: "card" | "pay_on_delivery";
  cardNumber: string;
  expiry: string;
  cvv: string;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

// Every section changes the form the same way: onChange("city", "Ikeja")
export type ChangeField = (field: keyof CheckoutForm, value: string) => void;
