// ReviewForm.tsx client/src/components/product/ReviewForm.tsx
// "Write a review": stars, a title and a comment. Sent to POST /api/reviews (server STEP 23), which only accepts
// it from someone whose order with this product was DELIVERED, once per product.

// STEP 35 (part 10): The review form

import { useState, type FormEvent } from "react";
import { MdStar, MdStarOutline } from "react-icons/md";
import { useToast } from "../../context/ToastContext";
import { api } from "../../utils/api";

const STAR_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

type ReviewFormProps = {
  productId: string;
  onDone: () => void; // reload the reviews and the product's stars
};

const ReviewForm = ({ productId, onDone }: ReviewFormProps) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0); // the star under the mouse, to preview
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (rating === 0) return setError("Please choose a star rating.");
    if (!comment.trim())
      return setError("Please tell other shoppers what you think.");

    setError("");
    setSending(true);
    try {
      await api("/reviews", {
        method: "POST",
        body: {
          productId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        },
      });
      showToast({
        type: "success",
        title: "Thank you for your review!",
        message: "It's now on the product page.",
      });
      onDone();
    } catch (err) {
      setError((err as Error).message); // e.g. "You have already reviewed this product..."
      setSending(false);
    }
  };

  const shown = hover || rating;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-2xl bg-panel p-5"
    >
      <h3 className="text-lg font-semibold text-ink">Write a review</h3>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">
          Your rating
        </legend>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              aria-label={`${star} star${star === 1 ? "" : "s"}: ${STAR_WORDS[star]}`}
              aria-pressed={rating === star}
              className="text-warning transition-transform hover:scale-110"
            >
              {star <= shown ? (
                <MdStar size={30} />
              ) : (
                <MdStarOutline size={30} />
              )}
            </button>
          ))}
          {shown > 0 && (
            <span className="ml-2 text-sm font-medium text-ink-soft">
              {STAR_WORDS[shown]}
            </span>
          )}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="review-title"
          className="mb-2 block text-sm font-medium text-ink"
        >
          Title <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="review-title"
          value={title}
          maxLength={100} // the server's limit (server STEP 23)
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Sums it up in a few words"
          className="h-12 w-full rounded-xl bg-surface px-4 text-[15px] outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="mb-2 block text-sm font-medium text-ink"
        >
          Your review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          maxLength={1000}
          rows={4}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What did you like or dislike? How did you use it?"
          className="w-full rounded-xl bg-surface px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="mt-1 text-right text-xs text-muted">
          {comment.length}/1000
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="h-12 rounded-xl bg-primary font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {sending ? "Posting..." : "Post review"}
      </button>
    </form>
  );
};

export default ReviewForm;