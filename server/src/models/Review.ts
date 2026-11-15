// Review model server/src/models/Review.ts
// A customer's star rating and comment on a product they bought AND received.

// STEP 23 (part 1): The Review model

import { model, Schema, Types } from "mongoose";

export interface IReview {
  product: Types.ObjectId;
  user: Types.ObjectId;
  order: Types.ObjectId; // the delivered order that proves they bought it ("Verified Purchase")
  name: string; // shown on the review, e.g. "Ada O." (never the email)
  rating: number; // 1 to 5 stars
  title?: string; // e.g. "Best headphones I've owned"
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    name: { type: String, required: true },
    rating: {
      type: Number,
      required: [true, "Please choose a star rating."],
      cast: "Rating must be a whole number from 1 to 5.", // "abc" -> this message instead of "Cast to Number failed"
      min: [1, "Rating must be a whole number from 1 to 5."],
      max: [5, "Rating must be a whole number from 1 to 5."],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number from 1 to 5.",
      }, // no 4.5
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "The title can be at most 100 characters."],
    },
    comment: {
      type: String,
      required: [true, "Please write a few words about the product."],
      trim: true,
      maxlength: [1000, "Your review can be at most 1,000 characters."],
    },
  },
  { timestamps: true },
);

// One review per customer per product. (MongoDB refuses a second one even if two requests arrive together.)
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// The product page lists a product's reviews, newest first: this index makes that fast
reviewSchema.index({ product: 1, createdAt: -1 });

export const Review = model<IReview>("Review", reviewSchema);
