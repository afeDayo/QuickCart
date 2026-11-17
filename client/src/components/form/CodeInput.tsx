// CodeInput.tsx client/src/components/form/CodeInput.tsx
// 6 boxes for the email code. Typing a digit jumps to the next box, Backspace goes back, and pasting
// "048213" fills all 6 at once.
//   <CodeInput value={code} onChange={setCode} />

// STEP 37 (part 2): The 6-digit code boxes

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

const LENGTH = 6;

type CodeInputProps = {
  value: string; // "0482" while typing, "048213" when complete
  onChange: (value: string) => void;
  invalid?: boolean;
};

const CodeInput = ({ value, onChange, invalid }: CodeInputProps) => {
  // One ref per box, so we can move the cursor between them
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from(
    { length: LENGTH },
    (_, index) => value[index] ?? "",
  );

  const focusBox = (index: number) =>
    boxes.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();

  const setDigit = (index: number, digit: string) => {
    const next = [...digits];
    next[index] = digit;
    onChange(next.join("").slice(0, LENGTH));
  };

  const handleChange = (index: number, typed: string) => {
    const digit = typed.replace(/\D/g, "").slice(-1); // only numbers; the last one typed
    if (!digit) return;
    setDigit(index, digit);
    focusBox(index + 1);
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) setDigit(index, "");
      else if (index > 0) {
        setDigit(index - 1, "");
        focusBox(index - 1);
      }
    }
    if (event.key === "ArrowLeft") focusBox(index - 1);
    if (event.key === "ArrowRight") focusBox(index + 1);
  };

  // Pasting "048213" (or "048 213" from the email) fills every box
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LENGTH);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    focusBox(pasted.length);
  };

  return (
    <div
      role="group"
      aria-label="6-digit verification code"
      className="flex justify-between gap-2 sm:gap-3"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            boxes.current[index] = element;
          }}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          inputMode="numeric" // phones show the number keypad
          autoComplete={index === 0 ? "one-time-code" : "off"} // phones can fill the code from the email/SMS
          maxLength={2}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={invalid ? true : undefined}
          className="h-14 w-full max-w-14 rounded-xl bg-field text-center text-2xl font-bold text-ink outline-none focus:ring-2 focus:ring-primary/40 aria-invalid:bg-danger-light aria-invalid:ring-2 aria-invalid:ring-danger/40"
        />
      ))}
    </div>
  );
};

export default CodeInput;

