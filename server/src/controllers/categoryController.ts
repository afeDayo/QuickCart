// categoryController.ts
// What happens when someone asks for categories: read them from MongoDB and reply with JSON.

// STEP 15: The categories API server/src/controllers/categoryController.ts
// GET /api/categories        -> every category with its number of products
// GET /api/categories/:slug  -> one category, e.g. /api/categories/home-living

import { Request, Response } from "express";
import { Types } from "mongoose";
import { Category } from "../models/Category";
import { liveProducts, Product } from "../models/Product";
import { AppError } from "../utils/AppError";

// How many products shoppers can see in each category: { "665f...": 15, "6660...": 6, ... }
// One "aggregate" query counts them all at once, instead of one query per category.
const countProductsByCategory = async () => {
  const rows = await Product.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: liveProducts() }, // only published (or scheduled and already live) products
    { $group: { _id: "$category", count: { $sum: 1 } } }, // one row per category, adding 1 per product
  ]);

  // Turn the rows into a Map so we can look a count up by category id
  return new Map(rows.map((row) => [String(row._id), row.count]));
};

// GET /api/categories
export const getCategories = async (_req: Request, res: Response) => {
  // Run both queries at the same time
  const [categories, counts] = await Promise.all([
    Category.find().select("-__v").sort({ _id: 1 }).lean(), // _id order = the order they were seeded
    countProductsByCategory(),
  ]);

  res.json({
    categories: categories.map((category) => ({
      ...category,
      productCount: counts.get(String(category._id)) ?? 0, // a category with no products gets 0
    })),
  });
};

// GET /api/categories/:slug
export const getCategoryBySlug = async (
  req: Request<{ slug: string }>,
  res: Response,
) => {
  const category = await Category.findOne({
    slug: req.params.slug.toLowerCase(),
  })
    .select("-__v")
    .lean();

  // No such category: errorHandler (STEP 14) turns this into a 404 JSON reply
  if (!category) {
    throw new AppError(404, `Category not found: ${req.params.slug}`);
  }

  const productCount = await Product.countDocuments({
    ...liveProducts(),
    category: category._id,
  });

  res.json({ category: { ...category, productCount } });
};
