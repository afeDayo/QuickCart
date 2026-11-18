// SelectInput.tsx client/src/components/form/SelectInput.tsx
// A labelled dropdown that looks like TextInput: "Primary Category [Electronics ⌄]". Used by the admin forms.
//   <SelectInput label="Primary Category" value={...} onChange={...}><option ...>...</option></SelectInput>

// STEP 42 (part 4): A dropdown and a text area that match TextInput

import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { MdExpandMore } from "react-icons/md";

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  labelAction?: ReactNode;
};

const SelectInput = ({
  label,
  error,
  labelAction,
  className = "",
  children,
  ...selectProps
}: SelectInputProps) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm leading-5 font-medium text-ink">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="relative">
        {/* appearance-none hides the browser's own arrow, so ours is the same in every browser */}
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-12 w-full cursor-pointer appearance-none rounded-xl bg-field pr-11 pl-4 text-[15px] text-ink outline-none focus:ring-2 focus:ring-primary/30 aria-invalid:bg-danger-light aria-invalid:ring-2 aria-invalid:ring-danger/40"
          {...selectProps}
        >
          {children}
        </select>
        <MdExpandMore
          size={22}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-soft"
        />
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] leading-4.5 text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectInput;
