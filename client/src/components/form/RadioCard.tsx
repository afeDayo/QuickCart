// RadioCard.tsx client/src/components/form/RadioCard.tsx
// A big choice card with a radio button: "◉ Standard Delivery [Recommended] .......... Free". Used for delivery,
// payment and saved addresses at checkout. Clicking anywhere on the card chooses it (it's all one <label>).

// STEP 38 (part 4): A radio card

import type { ReactNode } from "react";

type RadioCardProps = {
  name: string; // radios with the same name are one group: only one can be chosen
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: ReactNode;
  badge?: ReactNode;
  right?: ReactNode; // e.g. the price
  description?: ReactNode;
  disabled?: boolean;
  children?: ReactNode; // extra content shown under it while it's chosen (e.g. the card number boxes)
};

const RadioCard = ({
  name,
  value,
  checked,
  onChange,
  title,
  badge,
  right,
  description,
  disabled,
  children,
}: RadioCardProps) => {
  return (
    <div
      className={`rounded-2xl border-2 transition-colors ${
        checked
          ? "border-primary/40 bg-primary-light/30"
          : "border-line bg-surface"
      } ${disabled ? "opacity-55" : ""}`}
    >
      <label
        className={`flex items-start gap-3 p-4 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={() => onChange(value)}
          className="mt-1 size-4.5 shrink-0 accent-primary"
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex flex-wrap items-center gap-2 text-lg font-semibold text-ink">
              {title} {badge}
            </span>
            {right}
          </span>
          {description && (
            <span className="mt-1 block text-sm text-ink-soft">
              {description}
            </span>
          )}
        </span>
      </label>
      {checked && children && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

export default RadioCard;
