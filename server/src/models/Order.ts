// Order model server/src/models/Order.ts
// One placed order: what was bought (at what price), where it goes, how it's paid, and where it is now.

// STEP 22 (part 2): The Order model

import { model, Schema, Types } from "mongoose";
import { addressSchema, IAddress } from "./User";

// processing = placed, being packed  ("In Progress" tab)
// shipped    = with the courier      ("Shipped" tab; the tracker calls it "Dispatched")
// delivered  = handed over           ("Delivered" tab)
// cancelled  = cancelled             ("Cancelled" tab)
export const ORDER_STATUSES = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// One line of the order. Name, photo and price are COPIED from the product when the order is placed
// (a "snapshot"): if the price changes next week, this order still shows what the customer paid.
export interface IOrderItem {
  product: Types.ObjectId; // the product (for "Buy Again" and reviews)
  name: string;
  image: string;
  sku: string;
  price: number; // the price of ONE, in naira, when the order was placed
  quantity: number;
  color?: string; // e.g. "Midnight Black"
  lineTotal: number; // price x quantity
}

// One step of the tracker: "Order Placed Oct 24, 10:14 AM"
export interface IStatusUpdate {
  status: OrderStatus;
  note: string; // e.g. "Order placed", "Cancelled by you"
  at: Date;
}

// The "Payment Record" card. We NEVER store a full card number or CVV: only the brand and the last 4 digits.
export interface IPayment {
  method: "card" | "pay_on_delivery";
  status: "paid" | "pending" | "refunded"; // pay on delivery stays "pending" until delivery
  cardBrand?: string; // "Mastercard", "Visa", "Verve"
  cardLast4?: string; // "4242"
  reference?: string; // "PSTK-991204812"
  paidAt?: Date;
}

export interface IOrder {
  orderNumber: string; // "QC-1042" (the website shows it as #QC-1042)
  user: Types.ObjectId; // who placed it
  items: IOrderItem[];
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: IAddress; // a COPY of the address: editing the saved address later doesn't move this order
  deliveryMethod: "standard" | "express";
  payment: IPayment;
  subtotal: number; // all line totals added up
  deliveryFee: number;
  discount: number; // from the promo code (0 = none)
  promoCode?: string; // "QUICK25"
  total: number; // subtotal - discount + deliveryFee
  status: OrderStatus;
  statusHistory: IStatusUpdate[];
  estimatedDelivery: { from: Date; to: Date }; // "Oct 26 - Oct 27"
  courier?: string; // set when it's shipped (STEP 26), e.g. "QuickCart Express Freight"
  waybill?: string; // e.g. "QCK-LOS-994821-NG"
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date; // "Placed on ..." (added by timestamps)
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    sku: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    color: { type: String },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }, // the lines don't need their own ids
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true }, // set just before saving (see orderController)
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    contact: {
      firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
      },
      lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
    },
    // The SAME rules as a saved address (STEP 20.1): "Street address is required", ...
    shippingAddress: {
      type: addressSchema,
      required: [true, "Please choose a delivery address."],
    },
    deliveryMethod: {
      type: String,
      enum: ["standard", "express"],
      required: true,
    },
    payment: {
      method: {
        type: String,
        enum: ["card", "pay_on_delivery"],
        required: true,
      },
      status: {
        type: String,
        enum: ["paid", "pending", "refunded"],
        required: true,
      },
      cardBrand: { type: String },
      cardLast4: { type: String },
      reference: { type: String },
      paidAt: { type: Date },
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    promoCode: { type: String },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: "processing" },
    statusHistory: [
      {
        _id: false,
        status: { type: String, enum: ORDER_STATUSES, required: true },
        note: { type: String, default: "" },
        at: { type: Date, default: Date.now },
      },
    ],
    estimatedDelivery: { from: Date, to: Date },
    courier: { type: String },
    waybill: { type: String },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String, trim: true },
  },
  { timestamps: true },
);

// "My orders" always searches by user, newest first: an index makes that fast
orderSchema.index({ user: 1, createdAt: -1 });

export const Order = model<IOrder>("Order", orderSchema);
