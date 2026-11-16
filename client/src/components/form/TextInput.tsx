// TextInput.tsx client/src/components/form/TextInput.tsx
// A labelled input like the designs: soft blue box, optional icon on the left, green tick when valid,
// red message under it when wrong. Every form in the app uses it.
//   <TextInput label="Email Address" type="email" icon={MdOutlineMail} value={email} onChange={...} error={...} />

// STEP 31 (part 4): Form inputs

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { MdCheckCircle } from "react-icons/md";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string; // shown in red under the box
  icon?: IconType; // e.g. the envelope in "Email Address"
  valid?: boolean; // shows the green tick (the register design)
  labelAction?: ReactNode; // something on the right of the label, e.g. "Forgot password?"
  leading?: ReactNode; // a box before the input, e.g. "+234" for phone numbers
  trailing?: ReactNode; // something inside the box on the right, e.g. the eye button of a password
};

const TextInput = ({
  label,
  error,
  icon: Icon,
  valid,
  labelAction,
  leading,
  trailing,
  className = "",
  ...inputProps
}: TextInputProps) => {
  // A unique id links the label and the error message to the input (screen readers read them together)
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

      <div className="flex gap-2">
        {leading}

        <div className="relative flex-1">
          {Icon && (
            <Icon
              size={20}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
            />
          )}

          <input
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`h-12 w-full rounded-xl bg-field text-[15px] text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30 aria-invalid:bg-danger-light aria-invalid:ring-2 aria-invalid:ring-danger/40 ${
              Icon ? "pl-12" : "pl-4"
            } ${trailing || valid ? "pr-12" : "pr-4"}`}
            {...inputProps}
          />

          <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center">
            {trailing ??
              (valid && (
                <MdCheckCircle
                  size={20}
                  aria-label="Looks good"
                  className="text-success"
                />
              ))}
          </div>
        </div>
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] leading-4.5 text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextInput;
