// Checkbox.tsx client/src/components/form/Checkbox.tsx
// A checkbox with its text, e.g. "Remember me for 30 days" or "I agree to QuickCart's Terms of Service".
// The text can contain links (children), and clicking the text ticks the box (it's all one <label>).

// STEP 31 (part 4): Form inputs

import type { InputHTMLAttributes, ReactNode } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  children: ReactNode;
  error?: string;
};

const Checkbox = ({
  children,
  error,
  className = "",
  ...inputProps
}: CheckboxProps) => {
  return (
    <div className={className}>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-ink-soft">
        <input
          type="checkbox"
          className="mt-0.5 size-4.5 shrink-0 cursor-pointer accent-primary"
          {...inputProps}
        />
        <span>{children}</span>
      </label>
      {error && (
        <p className="mt-1.5 text-[13px] leading-4.5 text-danger">{error}</p>
      )}
    </div>
  );
};

export default Checkbox;
