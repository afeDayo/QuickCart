// productController.ts server/src/controllers/productController.ts
// The public products API: the Shop page list (with filters, search, sorting and pages)
// and the Product Details page. Only products shoppers may see (liveProducts) are ever returned.

// STEP 16: The products API
// GET /api/products             -> a page of products, e.g. ?category=electronics&sort=price-asc&page=2
// GET /api/products/:idOrSlug   -> one product with its category, bundle and related products

import { Request, Response } from "express";
import { SortOrder, Types } from "mongoose";
import { Category } from "../models/Category";
import { liveProducts, Product } from "../models/Product";
import { AppError } from "../utils/AppError";
import { escapeRegex } from "../utils/escapeRegex";

// The fields a product card needs. Leaving out the rest (description, specs...) keeps the list fast and small.
// costPrice is NOT here on purpose: it's admin-only.
const CARD_FIELDS =
  "name slug brand price oldPrice images ratings reviewCount badge tagline priceNote tags sold stock trackStock flashSaleStock colors category";

// ?sort=... -> how MongoDB should order the results (1 = smallest first, -1 = biggest first)
// _id is added as a tie-breaker so products with the same price always come in the same order.
const SORTS: Record<string, Record<string, SortOrder>> = {
  featured: { _id: 1 }, // the order in products.ts (the design's "Featured" order)
  newest: { createdAt: -1, _id: -1 },
  "price-asc": { price: 1, _id: 1 },
  "price-desc": { price: -1, _id: 1 },
  rating: { ratings: -1, reviewCount: -1 },
  "best-selling": { sold: -1, _id: 1 },
};

// --- Small helpers to read the query string safely --------------------------------
// Everything in req.query arrives as text (or an array, or nothing), never as a number.

// "  Headphones " -> "Headphones"; anything that isn't a single string -> ""
const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

// "15000" -> 15000; "" or "abc" -> undefined (meaning "no filter")
const toNumber = (value: unknown) => {
  const number = Number(text(value));
  return text(value) !== "" && Number.isFinite(number) ? number : undefined;
};

// For page and limit: a whole number above 0, otherwise the fallback ("abc", "-3", "0" -> fallback)
const wholeNumber = (value: unknown, fallback: number) => {
  const number = Math.floor(Number(text(value)));
  return number > 0 ? number : fallback;
};

// GET /api/products
export const getProducts = async (req: Request, res: Response) => {
  // Every filter is added to this list; a product must match ALL of them ($and).
  // It always starts with liveProducts(), so drafts and future products are never shown.
  const conditions: Record<string, unknown>[] = [liveProducts()];

  // ?category=electronics: the website sends the slug, the products store the category id
  const categorySlug = text(req.query.category).toLowerCase();
  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug });

    // An unknown category simply has no products (the Shop page shows "no products found")
    if (!category) {
      res.json({ products: [], total: 0, page: 1, pages: 0 });
      return;
    }
    conditions.push({ category: category._id });
  }

  // ?tag=flash-deal: the Home page sections
  const tag = text(req.query.tag).toLowerCase();
  if (tag) {
    conditions.push({ tags: tag }); // matches when the tags array CONTAINS this tag
  }

  // ?search=aura: the text anywhere in the name, brand or tags, ignoring capitals ("i")
  const search = text(req.query.search);
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    conditions.push({
      $or: [{ name: pattern }, { brand: pattern }, { tags: pattern }],
    });
  }

  // ?minPrice=10000&maxPrice=20000 (either one alone works too)
  const minPrice = toNumber(req.query.minPrice);
  const maxPrice = toNumber(req.query.maxPrice);
  if (minPrice !== undefined) {
    conditions.push({ price: { $gte: minPrice } }); // $gte = greater than or equal
  }
  if (maxPrice !== undefined) {
    conditions.push({ price: { $lte: maxPrice } }); // $lte = less than or equal
  }

  // ?sort=price-asc (unknown or missing -> featured)
  const sort = SORTS[text(req.query.sort)] ?? SORTS.featured;

  // ?page=2&limit=24: 24 per page like the design, never more than 60 at once
  const limit = Math.min(wholeNumber(req.query.limit, 24), 60);
  const page = wholeNumber(req.query.page, 1);

  const filter = { $and: conditions };

  // The page of products AND the total count, at the same time
  const [products, total] = await Promise.all([
    Product.find(filter)
      .select(CARD_FIELDS)
      .populate("category", "name slug") // swap the category id for { _id, name, slug }
      .sort(sort)
      .skip((page - 1) * limit) // page 2 with limit 24 skips the first 24
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({ products, total, page, pages: Math.ceil(total / limit) });
};

// A MongoDB id is exactly 24 characters of 0-9 and a-f
const OBJECT_ID = /^[a-f0-9]{24}$/i;

// GET /api/products/:idOrSlug
export const getProduct = async (
  req: Request<{ idOrSlug: string }>,
  res: Response,
) => {
  const { idOrSlug } = req.params;

  // Links can use either the id or the readable slug
  const which = OBJECT_ID.test(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug.toLowerCase() };

  const product = await Product.findOne({ $and: [which, liveProducts()] })
    .select("-costPrice -__v") // everything EXCEPT these
    .populate<{
      category: {
        _id: Types.ObjectId;
        name: string;
        slug: string;
        icon: string;
      };
    }>("category", "name slug icon")
    // Fill in the linked products with card fields, skipping any that are no longer live
    .populate({
      path: "bundleProducts",
      match: liveProducts(),
      select: CARD_FIELDS,
    })
    .populate({
      path: "relatedProducts",
      match: liveProducts(),
      select: CARD_FIELDS,
    })
    .lean();

  // Not found, or a draft/scheduled product: both look the same to shoppers
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  // The model says: empty relatedProducts = show the best sellers from the same category
  let relatedProducts: unknown[] = product.relatedProducts;
  if (relatedProducts.length === 0) {
    relatedProducts = await Product.find({
      $and: [
        liveProducts(),
        { category: product.category._id },
        { _id: { $ne: product._id } }, // $ne = not equal: don't recommend the product to itself
      ],
    })
      .select(CARD_FIELDS)
      .sort({ sold: -1 })
      .limit(4)
      .lean();
  }

  res.json({ product: { ...product, relatedProducts } });
};
