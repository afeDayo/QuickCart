// Product model
// Something the shop sells. Prices and whole naira, e.g 54000 = N45,000

import { model, Schema, Types } from "mongoose";

export interface IProductColor {
  name: string; // e.g. "Midnight Black"
  hex: string; // e.g. "#1f2937"
}

export interface IProductSpec {
  group: string; // e.g "Audio & Connectivity"
  label: string; // e.g "Driver Size"
  value: string; // e.g "40mm Neodymium"
}

export interface IProductHighlight {
  icon: string; // Material icon name, e.g "hearing"
  title: string; // e.g "Hybrid Active Noise Cancelling"
  text: string; // one or two sentences
}

// STEP 8: The Product model
// Everything about a product: name, slug, price (whole naira), stock, image, colours, specs, rating...

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  tagline?: string; // one short line for small cards e.g "Braided 1.8m lossless wire"
  priceNote?: string; // short line under the price on small cards e.g "free shipping"
  features: string[]; // short bullet points shown on the product page
  specs: IProductSpec[]; // the "Full Specifications" table
  category: Types.ObjectId; // points to a Category
  brand: string;
  sku: string; // stock code, e.g "QC-AU-9042"
  price: number;
  oldPrice?: number; // crossed-out price when on sale
  costPrice?: number; // what the shop paid (admin only)
  trackStock: boolean; // false = never sells out and stock isnt counted down (e.g made to order)
  stock: number;
  lowStockThreshold: number;
  images: string[]; // images[0] is the photo on product cards
  gallery: string[]; // large photos for the product details page (empty = use images)
  colors: IProductColor[];
  tags: string[];
  badge?: string; // e.g. "SALE", "TOP SELLER", "NEW"
  highlights: IProductHighlight[]; // the three features cards under the photos on the product page
  ratings: number; // average star rating 0 to 5
  reviewCount: number;
  ratingCounts: number[]; // how many 5, 4, 3, 2 and 1 star ratings (in that order)
  sold: number; // how many have been sold (used for "Best Sellers")
  flashSaleStock?: number; // units offered in the flash sales, used to show "Claimed: 82%"
  bundleProducts: Types.ObjectId[]; // "Frequently Bought Together" product
  relatedProducts: Types.ObjectId[]; // "Related Products" (empty = same category)
  status: "published" | "draft" | "scheduled";
  publishAt?: Date; // for "scheduled": the product goes live at this time
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: { type: String, required: true, unique: true, lowercase: true },

    description: { type: String, default: "" },

    tagline: { type: String },

    priceNote: { type: String },

    features: [{ type: String }],

    specs: [{ group: String, label: String, value: String }],

    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    brand: { type: String, default: "" },

    sku: { type: String, required: true, unique: true },

    price: { type: Number, required: true, min: 0 },

    oldPrice: { type: Number, min: 0 },

    costPrice: { type: Number, min: 0 },

    trackStock: { type: Boolean, default: true },

    stock: { type: Number, required: true, min: 0, default: 0 },

    lowStockThreshold: { type: Number, default: 10 },

    images: [{ type: String }],

    gallery: [{ type: String }],

    colors: [{ name: String, hex: String }],

    tags: [{ type: String }],

    badge: { type: String },

    highlights: [{ icon: String, title: String, text: String }],

    ratings: { type: Number, default: 0, min: 0, max: 5 },

    reviewCount: { type: Number, default: 0 },

    ratingCounts: [{ type: Number }],

    sold: { type: Number, default: 0, min: 0 },

    flashSaleStock: { type: Number, min: 0 },

    bundleProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],

    relatedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],

    status: {
      type: String,
      enum: ["published", "draft", "scheduled"],
      default: "published",
    },

    publishAt: { type: Date },
  },
  { timestamps: true },
);

// STEP 8 (part of this step): The Product model
// The filter every public product query uses.

// Products shoppers can see right now: published, or scheduled with their time already passed.
// Use it in every public query

export const liveProducts = () => {
  return {
    $or: [
      { status: "published" as const },
      { status: "scheduled" as const, publishAt: { $lte: new Date() } },
    ],
  };
};

export const Product = model<IProduct>("Product", productSchema);

// Next: STEP 9 (Make web-friendly names {slugs}) -> server/src/utils/slugify.ts
