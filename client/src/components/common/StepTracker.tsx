// StepTracker.tsx client/src/components/common/StepTracker.tsx
// "① Review Cart › ② Checkout › ③ Confirmation" at the top of the cart, checkout and confirmation pages.
//   <StepTracker current={1} />

// STEP 36 (part 2): The checkout steps

import { MdCheck, MdChevronRight } from "react-icons/md";

const STEPS = ["Review Cart", "Checkout", "Confirmation"];

const StepTracker = ({ current }: { current: 1 | 2 | 3 }) => {
  return (
    <ol
      aria-label="Checkout steps"
      className="mb-6 flex flex-wrap items-center gap-2 text-sm"
    >
      {STEPS.map((label, index) => {
        const number = index + 1;
        const done = number < current;
        const active = number === current;
        return (
          <li
            key={label}
            className="flex items-center gap-2"
            aria-current={active ? "step" : undefined}
          >
            {index > 0 && (
              <MdChevronRight
                size={16}
                aria-hidden="true"
                className="text-muted"
              />
            )}
            <span
              className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                active
                  ? "bg-primary text-white"
                  : done
                    ? "bg-success text-white"
                    : "bg-primary-light text-muted"
              }`}
            >
              {done ? <MdCheck size={16} aria-label="done" /> : number}
            </span>
            <span className={active ? "font-semibold text-ink" : "text-muted"}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default StepTracker;
