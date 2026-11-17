// SecurityCard.tsx client/src/components/account/SecurityCard.tsx
// "Password & Security": when the password was last changed, whether the email is verified, and links to fix either.

// STEP 39 (part 9): The security card

import {
  MdArrowForward,
  MdOutlineLockReset,
  MdOutlineMarkEmailRead,
  MdOutlineMarkEmailUnread,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// "12 days ago", "today"
const daysAgo = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
};

const SecurityCard = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <section
      aria-labelledby="security-title"
      className="flex flex-col rounded-3xl bg-surface p-6 shadow-card"
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary-light text-primary">
          <MdOutlineLockReset size={22} aria-hidden="true" />
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isEmailVerified ? "bg-mint/40 text-forest" : "bg-[#fff4e0] text-[#8a5300]"}`}
        >
          {user.isEmailVerified ? "Email Verified" : "Email Not Verified"}
        </span>
      </div>
      <h2 id="security-title" className="text-xl font-semibold text-ink">
        Password &amp; Security
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Password last updated:{" "}
        {user.passwordChangedAt
          ? daysAgo(user.passwordChangedAt)
          : `when you joined (${daysAgo(user.createdAt)})`}
      </p>
      {user.isEmailVerified ? (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-success">
          <MdOutlineMarkEmailRead size={16} aria-hidden="true" /> {user.email}{" "}
          is verified
        </p>
      ) : (
        <Link
          to="/verify-email"
          className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#8a5300] hover:underline"
        >
          <MdOutlineMarkEmailUnread size={16} aria-hidden="true" /> Verify your
          email now
        </Link>
      )}
      <Link
        to="/account/settings"
        className="mt-auto flex items-center gap-1 border-t border-line pt-4 text-sm font-semibold text-primary-hover hover:underline"
      >
        Update Security Settings <MdArrowForward size={16} aria-hidden="true" />
      </Link>
    </section>
  );
};

export default SecurityCard;
