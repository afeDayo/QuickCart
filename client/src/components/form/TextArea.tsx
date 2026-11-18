// TextArea.tsx client/src/components/form/TextArea.tsx
// A labelled multi-line box that looks like TextInput, with an optional "120 / 2000" counter.

// STEP 42 (part 4): A dropdown and a text area that match TextInput

import { useId, type ReactNode, type TextareaHTMLAttributes } from "react";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  labelAction?: ReactNode;
  hint?: ReactNode; // small grey text under the box
};

const TextArea = ({
  label,
  error,
  labelAction,
  hint,
  className = "",
  ...textareaProps
}: TextAreaProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const length = String(textareaProps.value ?? "").length;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm leading-5 font-medium text-ink">
          {label}
        </label>
        {labelAction}
      </div>

      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="block min-h-32 w-full resize-y rounded-xl bg-field px-4 py-3 text-[15px] leading-6 text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30 aria-invalid:bg-danger-light aria-invalid:ring-2 aria-invalid:ring-danger/40"
        {...textareaProps}
      />

      {(hint || textareaProps.maxLength) && (
        <p className="mt-1.5 flex justify-between gap-4 text-[13px] text-muted">
          <span>{hint}</span>
          {textareaProps.maxLength && (
            <span className="whitespace-nowrap">
              {length} / {textareaProps.maxLength}
            </span>
          )}
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] leading-4.5 text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextArea;
