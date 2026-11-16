// RatingStars.tsx client/src/components/common/RatingStars.tsx
// ★★★★☆ (48): the average rating as 5 stars, with halves, and the number of reviews.

// STEP 32 (part 6): Rating stars

import { MdStar, MdStarBorder, MdStarHalf } from "react-icons/md";

type RatingStarsProps = {
  rating: number; // 0 to 5, e.g. 4.8
  count?: number; // how many reviews, shown in brackets
  size?: number;
};

const RatingStars = ({ rating, count, size = 16 }: RatingStarsProps) => {
  // 4.8 -> 5 full stars, 4.3 -> 4 full and a half: round to the nearest half first
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-1.5">
      {/* The screen reader hears one sentence instead of "star star star star star" */}
      <span
        className="flex text-warning"
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((star) =>
          rounded >= star ? (
            <MdStar key={star} size={size} aria-hidden="true" />
          ) : rounded >= star - 0.5 ? (
            <MdStarHalf key={star} size={size} aria-hidden="true" />
          ) : (
            <MdStarBorder key={star} size={size} aria-hidden="true" />
          ),
        )}
      </span>
      {count !== undefined && (
        <span className="text-[13px] text-muted">({count})</span>
      )}
    </div>
  );
};

export default RatingStars;
