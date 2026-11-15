// reviewController.ts server/src/controllers/reviewController.ts
// Product reviews. Only customers who bought a product AND received it (a delivered order) can review it.

// STEP 23 (part 2): Reviews
// GET    /api/reviews/product/:idOrSlug     -> a product's reviews (public), ?rating=5&sort=highest&page=2
// GET    /api/reviews/mine                  -> my reviews (the "Leave Review" buttons on Order History)
// GET    /api/reviews/can-review/:productId -> may I review this product? (shows or hides "Write a review")
// POST   /api/reviews                       -> write a review
// PATCH  /api/reviews/:reviewId             -> edit my review
// DELETE /api/reviews/:reviewId             -> delete my review (an admin can delete any review)

import { Request, Response } from "express";
import { isValidObjectId, Types } from "mongoose";
import { Order } from "../models/Order";
import { liveProducts, Product } from "../models/Product";
import { Review } from "../models/Review";
import { AppError } from "../utils/AppError";
import { OBJECT_ID, wholeNumber } from "./productController";

const me = (req: Request) => req.user!;

// What a shopper sees on a review (no user id, no order id)
const PUBLIC_FIELDS = "name rating title comment createdAt";

// ===== Helpers =====

// The product's stars change when a review is written (add), deleted (remove) or its stars are edited (both).
// The demo products already have made-up ratings (e.g. 4.8 from 248 reviews), so we ADJUST those numbers
// instead of recalculating from the reviews in the database (that would wipe out the demo numbers).
const updateProductRating = async (
  productId: Types.ObjectId,
  change: { add?: number; remove?: number },
) => {
  const product = await Product.findById(productId).select(
    "ratings reviewCount ratingCounts",
  );
  if (!product) return; // the product was deleted: nothing to update

  const counts = [0, 1, 2, 3, 4].map((i) => product.ratingCounts[i] ?? 0); // always 5 bars: [5★, 4★, 3★, 2★, 1★]
  let starsTotal = product.ratings * product.reviewCount; // 4.8 x 248 = all the stars added up
  let reviewCount = product.reviewCount;

  if (change.remove) {
    counts[5 - change.remove] = Math.max(0, counts[5 - change.remove] - 1); // 5★ is counts[0], 1★ is counts[4]
    starsTotal -= change.remove;
    reviewCount -= 1;
  }

  if (change.add) {
    counts[5 - change.add] += 1;
    starsTotal += change.add;
    reviewCount += 1;
  }

  reviewCount = Math.max(0, reviewCount);
  const average = reviewCount > 0 ? starsTotal / reviewCount : 0;

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        ratingCounts: counts,
        reviewCount,
        ratings: Math.min(5, Math.max(0, Math.round(average * 100) / 100)), // 4.8008 -> 4.8, always 0 to 5
      },
    },
  );
};

// "Ada Obi" -> "Ada O.", "bola tinubu" -> "Bola T." (enough to feel real, without showing the full name)
const displayName = (user: { firstName: string; lastName: string }) => {
  const first =
    user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);
  return `${first} ${user.lastName.charAt(0).toUpperCase()}.`;
};

// One of my delivered orders that has this product in it (or null)
const deliveredOrderWith = (userId: Types.ObjectId, productId: string) =>
  Order.findOne({
    user: userId,
    status: "delivered",
    "items.product": productId,
  }).select("_id orderNumber");

// One of MY reviews from the URL. Someone else's review = 404.
const findMyReview = async (req: Request<{ reviewId: string }>) => {
  const review = isValidObjectId(req.params.reviewId)
    ? await Review.findOne({ _id: req.params.reviewId, user: me(req)._id })
    : null;

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  return review;
};

// ===== Public =====

// How the reviews can be sorted
const SORTS = new Map<string, Record<string, 1 | -1>>([
  ["newest", { createdAt: -1 }],
  ["oldest", { createdAt: 1 }],
  ["highest", { rating: -1, createdAt: -1 }],
  ["lowest", { rating: 1, createdAt: -1 }],
]);

// GET /api/reviews/product/smart-watch-ultra?rating=5&sort=highest&page=1&limit=10
export const getProductReviews = async (
  req: Request<{ idOrSlug: string }>,
  res: Response,
) => {
  const { idOrSlug } = req.params;
  const which = OBJECT_ID.test(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug.toLowerCase() };

  const product = await Product.findOne({
    $and: [which, liveProducts()],
  }).select("ratings reviewCount ratingCounts");
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const filter: Record<string, unknown> = { product: product._id };

  // ?rating=5: clicking the "5 star" bar shows only 5-star reviews
  const rating = Number(req.query.rating);
  if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
    filter.rating = rating;
  }

  const sort = SORTS.get(String(req.query.sort)) ?? SORTS.get("newest")!;
  const limit = Math.min(wholeNumber(req.query.limit, 10), 50);
  const page = wholeNumber(req.query.page, 1);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .select(PUBLIC_FIELDS)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  res.json({
    // the stars and bars at the top: "4.8 ★ (248)", 5★ ████████ 199 ...
    summary: {
      ratings: product.ratings,
      reviewCount: product.reviewCount,
      ratingCounts: product.ratingCounts,
    },
    reviews,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

// ===== Logged in =====

// GET /api/reviews/mine -> all my reviews (with the product's name, slug and photo)
export const getMyReviews = async (req: Request, res: Response) => {
  const reviews = await Review.find({ user: me(req)._id })
    .select(`${PUBLIC_FIELDS} product`)
    .populate("product", "name slug images")
    .sort({ createdAt: -1 });

  res.json({ reviews });
};

// GET /api/reviews/can-review/:productId -> { canReview, reason, review }
export const canReviewProduct = async (
  req: Request<{ productId: string }>,
  res: Response,
) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) {
    throw new AppError(404, "Product not found");
  }

  const review = await Review.findOne({
    product: productId,
    user: me(req)._id,
  });
  if (review) {
    return res.json({
      canReview: false,
      reason: "You have already reviewed this product.",
      review,
    });
  }

  const order = await deliveredOrderWith(me(req)._id, productId);
  res.json({
    canReview: Boolean(order),
    reason: order
      ? null
      : "Only customers who have received this product can review it.",
    review: null,
  });
};

// POST /api/reviews   { "productId", "rating": 5, "title"?: "...", "comment": "..." }
export const createReview = async (req: Request, res: Response) => {
  const user = me(req);
  const { productId, rating, title, comment } = req.body ?? {};

  if (
    !isValidObjectId(productId) ||
    !(await Product.exists({ $and: [{ _id: productId }, liveProducts()] }))
  ) {
    throw new AppError(404, "Product not found");
  }

  if (await Review.exists({ product: productId, user: user._id })) {
    throw new AppError(
      409,
      "You have already reviewed this product. You can edit your review instead.",
    );
  }

  // The rule: you must have RECEIVED it. Not just ordered: an order that's still on its way doesn't count.
  const order = await deliveredOrderWith(user._id, productId);
  if (!order) {
    throw new AppError(
      403,
      "Only customers who have received this product can review it.",
    );
  }

  let review;
  try {
    review = await Review.create({
      product: productId,
      user: user._id,
      order: order._id,
      name: displayName(user),
      rating,
      title,
      comment,
    }); // no stars, no comment, 6 stars -> the model's messages (400)
  } catch (error) {
    // Two clicks at the same moment: both passed the check above, the unique index stops the second one
    if ((error as { code?: number }).code === 11000) {
      throw new AppError(
        409,
        "You have already reviewed this product. You can edit your review instead.",
      );
    }
    throw error;
  }

  await updateProductRating(review.product, { add: review.rating });

  res.status(201).json({ message: "Thank you for your review!", review });
};

// PATCH /api/reviews/:reviewId   { "rating"?, "title"?, "comment"? }
export const updateReview = async (
  req: Request<{ reviewId: string }>,
  res: Response,
) => {
  const review = await findMyReview(req);
  const oldRating = review.rating;
  const { rating, title, comment } = req.body ?? {};

  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;

  await review.save(); // the same rules as a new review

  // 4 stars -> 5 stars: take the 4 out of the product's rating and put the 5 in
  if (review.rating !== oldRating) {
    await updateProductRating(review.product, {
      remove: oldRating,
      add: review.rating,
    });
  }

  res.json({ message: "Your review has been updated.", review });
};

// DELETE /api/reviews/:reviewId
export const deleteReview = async (
  req: Request<{ reviewId: string }>,
  res: Response,
) => {
  const user = me(req);
  if (!isValidObjectId(req.params.reviewId)) {
    throw new AppError(404, "Review not found");
  }

  // Customers delete their own reviews. An admin can delete any review (e.g. a rude one).
  const filter =
    user.role === "admin"
      ? { _id: req.params.reviewId }
      : { _id: req.params.reviewId, user: user._id };

  // findOneAndDelete finds AND deletes in one step: deleting twice can't take the stars off twice
  const review = await Review.findOneAndDelete(filter);
  if (!review) {
    throw new AppError(404, "Review not found");
  }

  await updateProductRating(review.product, { remove: review.rating });

  res.json({ message: "The review has been deleted." });
};
