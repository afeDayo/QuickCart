// PasswordStrength.tsx client/src/components/form/PasswordStrength.tsx
// The "PASSWORD STRENGTH" box under "Create password" (register design, and reset password in STEP 37):
// 4 bars, Weak / Medium / Strong, and a tick next to each rule.

// STEP 31 (part 4): Form inputs

import { MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";
import { PASSWORD_RULES } from "../../utils/password";

// How many rules pass -> the word and colour. Tailwind needs the full class names written out (no "bg-" + colour).
const LEVELS = [
  { word: "Too weak", color: "bg-danger", text: "text-danger" }, // 0
  { word: "Weak", color: "bg-danger", text: "text-danger" }, // 1
  { word: "Medium", color: "bg-warning", text: "text-warning" }, // 2
  { word: "Medium", color: "bg-warning", text: "text-warning" }, // 3
  { word: "Strong", color: "bg-success", text: "text-success" }, // 4
];

const PasswordStrength = ({ password }: { password: string }) => {
  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  const level = LEVELS[passed];

  return (
    <div className="rounded-xl bg-panel p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] leading-4 font-bold tracking-wider text-ink-soft uppercase">
          Password strength
        </p>
        {/* aria-live: a screen reader says the new strength while you type */}
        <p
          aria-live="polite"
          className={`flex items-center gap-1 text-xs font-semibold ${level.text}`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${level.color}`}
          />
          {level.word}
        </p>
      </div>

      <div aria-hidden="true" className="mb-3 grid grid-cols-4 gap-1.5">
        {PASSWORD_RULES.map((rule, index) => (
          <span
            key={rule.label}
            className={`h-1 rounded-full transition-colors ${index < passed ? level.color : "bg-line-soft"}`}
          />
        ))}
      </div>

      <ul className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li
              key={rule.label}
              className={`flex items-center gap-2 text-[13px] leading-4.5 ${ok ? "text-ink" : "text-muted"}`}
            >
              {ok ? (
                <MdCheckCircle
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-success"
                />
              ) : (
                <MdRadioButtonUnchecked
                  size={16}
                  aria-hidden="true"
                  className="shrink-0"
                />
              )}
              {rule.label}
              <span className="sr-only">{ok ? "(done)" : "(not yet)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrength;
