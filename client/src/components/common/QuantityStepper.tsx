// QuantityStepper.tsx client/src/components/common/QuantityStepper.tsx
// "−  1  +": choose how many. Used on the product page and in the cart (STEP 36).
//   <QuantityStepper value={quantity} max={10} onChange={setQuantity} />

// STEP 35 (part 4): Quantity stepper

import { MdAdd, MdRemove } from "react-icons/md";

type QuantityStepperProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label?: string; // for screen readers, e.g. "Quantity of Wireless Headphones"
  size?: "md" | "sm";
};

const QuantityStepper = ({
  value,
  max,
  onChange,
  label = "Quantity",
  size = "md",
}: QuantityStepperProps) => {
  const button =
    size === "md"
      ? "flex size-9 items-center justify-center rounded-full bg-surface text-ink shadow-card disabled:opacity-40"
      : "flex size-7 items-center justify-center rounded-full bg-surface text-ink shadow-card disabled:opacity-40";

  return (
    <div
      role="group"
      aria-label={label}
      className={`flex items-center gap-3 rounded-full bg-field ${size === "md" ? "h-12 px-2" : "h-9 px-1.5"}`}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="One less"
        className={button}
      >
        <MdRemove size={18} />
      </button>
      {/* aria-live: a screen reader says the new number after each click */}
      <span
        aria-live="polite"
        className="min-w-6 text-center text-base font-semibold text-ink"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="One more"
        className={button}
      >
        <MdAdd size={18} />
      </button>
    </div>
  );
};

export default QuantityStepper;
