// PromoCodeForm.tsx client/src/components/cart/PromoCodeForm.tsx
// "DISCOUNT VOUCHER": type a code, press Apply. The cart page asks the server (POST /api/promo-codes/check).
// Once applied, it shows the code with a Remove button instead of the box.

// STEP 36 (part 5): The promo code box

import { useState, type FormEvent } from "react";
import { MdClose, MdOutlineLocalOffer } from "react-icons/md";
import type { PromoResult } from "../../utils/promo";

type PromoCodeFormProps = {
  applied: PromoResult | null;
  error: string;
  checking: boolean;
  onApply: (code: string) => void;
  onRemove: () => void;
};

const PromoCodeForm = ({
  applied,
  error,
  checking,
  onApply,
  onRemove,
}: PromoCodeFormProps) => {
  const [code, setCode] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.trim()) onApply(code.trim());
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-mint/30 px-4 py-3">
        <p className="text-sm">
          <span className="font-mono font-bold text-forest">
            {applied.code}
          </span>
          <span className="block text-xs text-ink-soft">
            {applied.description}
          </span>
        </p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove code ${applied.code}`}
          className="text-ink-soft hover:text-danger"
        >
          <MdClose size={20} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label
        htmlFor="promo-code"
        className="mb-2 block text-xs font-bold tracking-wider text-ink-soft uppercase"
      >
        Discount voucher
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MdOutlineLocalOffer
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
          />
          <input
            id="promo-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Promo code (try QUICK10)"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "promo-error" : undefined}
            className="h-12 w-full rounded-xl bg-field pr-3 pl-10 text-[15px] uppercase outline-none placeholder:normal-case focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="submit"
          disabled={checking}
          className="h-12 rounded-xl bg-primary-light px-5 font-semibold text-ink hover:bg-info-light disabled:opacity-60"
        >
          {checking ? "..." : "Apply"}
        </button>
      </div>
      {error && (
        <p
          id="promo-error"
          role="alert"
          className="mt-2 text-[13px] text-danger"
        >
          {error}
        </p>
      )}
    </form>
  );
};

export default PromoCodeForm;
