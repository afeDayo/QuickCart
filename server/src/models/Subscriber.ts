// Subscriber model server/src/models/Subscriber.ts
// An email address from the footer's "Subscribe to QuickCart VIP Drops" box.
// We keep our own list (so the admin can count subscribers) AND copy each one to Brevo (to send newsletters).

// STEP 24 (part 1): The Subscriber model

import { model, Schema } from "mongoose";

export interface ISubscriber {
  email: string;
  isSubscribed: boolean; // false = they clicked "unsubscribe" (we keep the row so we know not to email them)
  unsubscribeToken: string; // the HASH of the secret in their unsubscribe link (like the reset token, STEP 19)
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

const subscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: [true, "Please enter your email address."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address."],
    },
    isSubscribed: { type: Boolean, default: true },
    unsubscribeToken: { type: String, required: true, select: false }, // never sent back to the website
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true },
);

export const Subscriber = model<ISubscriber>("Subscriber", subscriberSchema);
