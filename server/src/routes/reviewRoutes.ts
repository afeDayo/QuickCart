// reviewRoutes.ts server/src/routes/reviewRoutes.ts
// routes/index.ts puts these under /api/reviews.

// STEP 23 (part 3): Review routes

import { Router } from "express";
import {
  canReviewProduct,
  createReview,
  deleteReview,
  getMyReviews,
  getProductReviews,
  updateReview,
} from "../controllers/reviewController";
import { protect } from "../middleware/auth";

const router = Router();

// Anyone can READ reviews
router.get("/product/:idOrSlug", getProductReviews);

// Everything else needs a login (protect on each route, because the route above must stay public)
router.get("/mine", protect, getMyReviews);
router.get("/can-review/:productId", protect, canReviewProduct);
router.post("/", protect, createReview);
router.patch("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

export default router;
