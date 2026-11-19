// ProductReviews.tsx client/src/components/product/ProductReviews.tsx
// The "Customer Reviews" tab: the average with the 5★–1★ bars, "Write a review" (for buyers of a delivered order),
// and the reviews themselves, newest first, 5 at a time.

// STEP 35 (part 11): Reviews

import { useState } from "react";
import { MdOutlineRateReview, MdVerified } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import type {
  CanReviewResponse,
  Product,
  ReviewsResponse,
} from "../../types/api";
import Pagination from "../common/Pagination";
import RatingStars from "../common/RatingStars";
import ReviewForm from "./ReviewForm";

type ProductReviewsProps = {
  product: Product;
  onReviewed: () => void; // a new review changes the product's stars: the page reloads the product
};

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest rating" },
  { value: "lowest", label: "Lowest rating" },
];

const ProductReviews = ({ product, onReviewed }: ProductReviewsProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");

  const reviews = useApi<ReviewsResponse>(
    `/reviews/product/${product._id}?limit=5&page=${page}&sort=${sort}`,
  );
  // Only ask "can I review this?" when logged in (null = don't load)
  const canReview = useApi<CanReviewResponse>(
    user ? `/reviews/can-review/${product._id}` : null,
  );

  const summary = reviews.data?.summary ?? {
    ratings: product.ratings,
    reviewCount: product.reviewCount,
    ratingCounts: product.ratingCounts,
  };
  const counts =
    summary.ratingCounts.length === 5 ? summary.ratingCounts : [0, 0, 0, 0, 0];

  const afterReview = () => {
    reviews.reload();
    canReview.reload();
    onReviewed();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[320px_1fr] max-lg:grid-cols-1">
      {/* Left: the average and the bars */}
      <div>
        <div className="flex items-center gap-4">
          <p className="text-5xl font-bold text-ink">
            {summary.ratings.toFixed(1)}
          </p>
          <div>
            <RatingStars rating={summary.ratings} size={18} />
            <p className="mt-1 text-sm text-muted">
              {summary.reviewCount} ratings
            </p>
          </div>
        </div>

        <ul className="mt-5 flex flex-col gap-2">
          {counts.map((count, index) => {
            const stars = 5 - index; // the list is [5★, 4★, 3★, 2★, 1★]
            const percent =
              summary.reviewCount > 0
                ? Math.round((count / summary.reviewCount) * 100)
                : 0;
            return (
              <li key={stars} className="flex items-center gap-3 text-sm">
                <span className="w-3 text-ink-soft">{stars}</span>
                <span
                  className="h-2 flex-1 overflow-hidden rounded-full bg-info-light"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full rounded-full bg-success"
                    style={{ width: `${percent}%` }}
                  />
                </span>
                <span className="w-10 text-right text-muted">{percent}%</span>
                <span className="sr-only">
                  {stars} stars: {count} ratings
                </span>
              </li>
            );
          })}
        </ul>

        {/* Write a review: logged out / can review / can't (with the server's reason) */}
        <div className="mt-6">
          {!user ? (
            <p className="rounded-2xl bg-panel p-4 text-sm text-ink-soft">
              <Link
                to="/login"
                state={{ from: location }}
                className="font-semibold text-primary-hover hover:underline"
              >
                Log in
              </Link>{" "}
              to review a product you've received.
            </p>
          ) : canReview.data?.canReview ? (
            <ReviewForm productId={product._id} onDone={afterReview} />
          ) : (
            canReview.data?.reason && (
              <p className="rounded-2xl bg-panel p-4 text-sm text-ink-soft">
                {canReview.data.reason}
              </p>
            )
          )}
        </div>
      </div>

      {/* Right: the reviews */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-ink">
            {reviews.data
              ? `${reviews.data.total} written ${reviews.data.total === 1 ? "review" : "reviews"}`
              : "Reviews"}
          </h3>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            Sort
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl bg-field px-3 font-medium text-ink outline-none"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {reviews.error ? (
          <p role="alert" className="text-sm text-danger">
            {reviews.error}
          </p>
        ) : reviews.data && reviews.data.reviews.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-panel px-6 py-10 text-center">
            <MdOutlineRateReview
              size={32}
              aria-hidden="true"
              className="mb-3 text-primary"
            />
            <p className="font-semibold text-ink">No written reviews yet</p>
            <p className="mt-1 text-sm text-ink-soft">
              Bought it? Once it's delivered, you can be the first to review it.
            </p>
          </div>
        ) : (
          <ul
            className={`flex flex-col gap-4 ${reviews.loading ? "opacity-50" : ""}`}
          >
            {reviews.data?.reviews.map((review) => (
              <li
                key={review._id}
                className="rounded-2xl border border-line p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{review.name}</p>
                  {/* Every review is from a delivered order (the server checks), so every one is verified */}
                  <p className="flex items-center gap-1 text-xs font-semibold text-success">
                    <MdVerified size={15} aria-hidden="true" /> Verified Buyer
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <RatingStars rating={review.rating} size={15} />
                  <span className="text-xs text-muted">
                    {new Date(review.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {review.title && (
                  <p className="mt-3 font-semibold text-ink">{review.title}</p>
                )}
                <p className="mt-1 text-[15px] leading-6 text-ink-soft">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        )}

        {reviews.data && (
          <div className="mt-6 flex justify-center">
            <Pagination
              page={reviews.data.page}
              pages={reviews.data.pages}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
