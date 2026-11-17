// CheckoutPage.tsx client/src/pages/cart/CheckoutPage.tsx
// The checkout (design: Checkout): ① contact, ② address, ③ delivery, ④ payment, and the summary with PLACE ORDER NOW.
// It sends POST /api/orders (server STEP 22). The server re-checks every price, the stock, the promo code and the
// Lagos-only options, so nothing here can be faked from the browser. It's inside ProtectedRoute (login required).

// STEP 38 (part 10): The Checkout page

import { useEffect, useState } from "react";
import { MdOutlineRemoveShoppingCart, MdVerifiedUser } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import CheckOUTSummary from "../../components/checkout/CheckOUTSummary";
import ContactInfoForm from "../../components/checkout/ContactInfoForm";
import DeliveryAddressForm from "../../components/checkout/DeliveryAddressForm";
import DeliveryMethodForm from "../../components/checkout/DeliveryMethodForm";
import PaymentMethodForm from "../../components/checkout/PaymentMethodForm";
import EmptyState from "../../components/common/EmptyState";
import StepTracker from "../../components/common/StepTracker";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import type { OrderResponse } from "../../types/api";
import type {
  ChangeField,
  CheckoutErrors,
  CheckoutForm,
} from "../../types/checkout";
import { api } from "../../utils/api";
import { isLagos, localPhone } from "../../utils/nigeria";
import {
  clearSavedPromo,
  getSavedPromo,
  type PromoResult,
} from "../../utils/promo";

const EMAIL_RULE = /^\S+@\S+\.\S+$/;
const EXPRESS_FEE = 2500; // the server's price (DELIVERY_OPTIONS, server STEP 22); the server charges its own anyway

const CheckoutPage = () => {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const saved = user?.addresses ?? [];
  const defaultAddress = saved.find((address) => address.isDefault) ?? saved[0];

  // The form starts filled in from the account (ProtectedRoute guarantees there's a user)
  const [form, setForm] = useState<CheckoutForm>(() => ({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: localPhone(user?.phone),
    addressId: defaultAddress?._id ?? "new",
    street: "",
    city: "",
    state: "",
    instructions: "",
    deliveryMethod: "standard",
    paymentMethod: "card",
    cardNumber: "",
    expiry: "",
    cvv: "",
  }));
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [serverError, setServerError] = useState("");
  const [placing, setPlacing] = useState(false);

  const change: ChangeField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError("");
  };

  // Express and Pay on Delivery need a Lagos address. If the address isn't in Lagos, fall back to the other choice
  // (worked out here, so switching back to a Lagos address brings your choice back).
  const chosenState =
    form.addressId === "new"
      ? form.state
      : (saved.find((address) => address._id === form.addressId)?.state ?? "");
  const lagos = isLagos(chosenState);
  const deliveryMethod = lagos ? form.deliveryMethod : "standard";
  const paymentMethod = lagos ? form.paymentMethod : "card";
  const deliveryFee = deliveryMethod === "express" ? EXPRESS_FEE : 0;

  // The promo code from the cart (STEP 36): ask the server what it's worth for this subtotal, to show it.
  // (Same "labelled answer" pattern as the cart page. The order itself is checked again by the server.)
  const [promoCode] = useState(getSavedPromo);
  const [promo, setPromo] = useState<{
    key: string;
    result: PromoResult | null;
  } | null>(null);
  const promoKey = `${promoCode}|${subtotal}`;
  useEffect(() => {
    if (!promoCode || subtotal <= 0) return;
    let cancelled = false;
    api<PromoResult>("/promo-codes/check", {
      method: "POST",
      body: { code: promoCode, subtotal },
    })
      .then((result) => !cancelled && setPromo({ key: promoKey, result }))
      .catch(() => !cancelled && setPromo({ key: promoKey, result: null })); // no longer valid: just don't use it
    return () => {
      cancelled = true;
    };
  }, [promoCode, subtotal, promoKey]);
  const applied = promo?.key === promoKey ? promo.result : null;

  const validate = () => {
    const found: CheckoutErrors = {};
    if (!form.firstName.trim()) found.firstName = "First name is required.";
    if (!form.lastName.trim()) found.lastName = "Last name is required.";
    if (!EMAIL_RULE.test(form.email.trim()))
      found.email = "Please enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length < 10)
      found.phone = "Please enter a phone number the rider can call.";
    if (form.addressId === "new") {
      if (!form.street.trim()) found.street = "Street address is required.";
      if (!form.city.trim()) found.city = "City is required.";
      if (!form.state) found.state = "Please choose a state.";
    }
    if (paymentMethod === "card") {
      const digits = form.cardNumber.replace(/\D/g, "");
      if (digits.length < 12 || digits.length > 19)
        found.cardNumber = "Please enter a valid card number.";
      if (!/^\d{2}\/\d{2}$/.test(form.expiry))
        found.expiry = "Use MM/YY, e.g. 08/28.";
      if (!/^\d{3,4}$/.test(form.cvv)) found.cvv = "3 digits on the back.";
    }
    return found;
  };

  const placeOrder = async () => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setServerError("Please check the highlighted fields.");
      return;
    }

    setPlacing(true);
    setServerError("");
    try {
      const reply = await api<OrderResponse>("/orders", {
        method: "POST",
        body: {
          // Only ids and quantities: the server looks up the real prices itself
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            color: item.color,
          })),
          contact: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
          },
          ...(form.addressId === "new"
            ? {
                address: {
                  fullName: `${form.firstName} ${form.lastName}`.trim(),
                  phone: form.phone.trim(),
                  street: form.street.trim(),
                  city: form.city.trim(),
                  state: form.state,
                  country: "Nigeria",
                  instructions: form.instructions.trim() || undefined,
                },
              }
            : { addressId: form.addressId }),
          deliveryMethod,
          paymentMethod,
          ...(paymentMethod === "card"
            ? {
                card: {
                  number: form.cardNumber,
                  expiry: form.expiry,
                  cvv: form.cvv,
                },
              }
            : {}),
          ...(applied ? { promoCode: applied.code } : {}),
        },
      });

      // Placed! Go to the confirmation, then empty the cart and forget the promo code
      navigate(`/order-confirmation/${reply.order.orderNumber}`, {
        replace: true,
      });
      clearCart();
      clearSavedPromo();
    } catch (error) {
      // e.g. 402 "Your card was declined. Please try another card." or 400 "Only 3 left of ..."
      setServerError((error as Error).message);
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-360 px-4 py-16 md:px-12">
        <EmptyState
          icon={MdOutlineRemoveShoppingCart}
          title="Your cart is empty"
          text="Add something to your cart before checking out."
          action={
            <Link
              to="/shop"
              className="flex h-11 items-center rounded-xl bg-primary px-6 font-semibold text-white hover:bg-primary-hover"
            >
              Start Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-360 px-4 pt-6 pb-20 md:px-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
          <MdVerifiedUser size={16} aria-hidden="true" /> Secure Checkout
        </p>
        <StepTracker current={2} />
      </div>
      <h1 className="sr-only">Checkout</h1>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <ContactInfoForm
            form={form}
            errors={errors}
            onChange={change}
            verified={Boolean(user?.isEmailVerified)}
          />
          <DeliveryAddressForm
            form={form}
            errors={errors}
            onChange={change}
            saved={saved}
          />
          <DeliveryMethodForm
            value={deliveryMethod}
            lagos={lagos}
            onChange={(value) => change("deliveryMethod", value)}
          />
          <PaymentMethodForm
            form={{ ...form, paymentMethod }}
            errors={errors}
            onChange={change}
            lagos={lagos}
          />
        </div>

        <CheckOUTSummary
          items={items}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          deliveryLabel={deliveryMethod === "express" ? "Express" : "Standard"}
          promo={
            applied ? { code: applied.code, discount: applied.discount } : null
          }
          error={serverError}
          placing={placing}
          onPlace={placeOrder}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
