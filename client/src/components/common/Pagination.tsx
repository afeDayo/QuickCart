// Pagination.tsx client/src/components/common/Pagination.tsx
// "‹ 1 2 3 4 … 7 ›" under a list. Used by the Shop page, and later Order History and the admin tables.
//   <Pagination page={2} pages={7} onChange={(page) => ...} />

// STEP 34 (part 1): Pagination

import { MdChevronLeft, MdChevronRight } from "react-icons/md";

type PaginationProps = {
  page: number;
  pages: number;
  onChange: (page: number) => void;
};

// Which buttons to show: always the first and last page, and the pages around the current one.
// Gaps become "…". pagesToShow(5, 10) -> [1, "…", 4, 5, 6, "…", 10]
const pagesToShow = (page: number, pages: number): (number | "…")[] => {
  const wanted = new Set(
    [1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages),
  );
  const sorted = [...wanted].sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  sorted.forEach((n, index) => {
    if (index > 0 && n - sorted[index - 1] > 1) result.push("…");
    result.push(n);
  });
  return result;
};

const buttonClasses =
  "flex size-10 items-center justify-center rounded-xl bg-surface text-sm font-medium text-ink shadow-card transition-colors hover:bg-field disabled:cursor-not-allowed disabled:opacity-40";

const Pagination = ({ page, pages, onChange }: PaginationProps) => {
  if (pages <= 1) return null; // one page: nothing to choose

  return (
    <nav aria-label="Pages" className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={buttonClasses}
      >
        <MdChevronLeft size={20} />
      </button>

      {pagesToShow(page, pages).map((item, index) =>
        item === "…" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1 text-muted"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined} // tells screen readers "current page"
            aria-label={`Page ${item}`}
            className={
              item === page
                ? `${buttonClasses} bg-primary! text-white hover:bg-primary-hover!`
                : buttonClasses
            }
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
        className={buttonClasses}
      >
        <MdChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Pagination;
