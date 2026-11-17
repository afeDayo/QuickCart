// CheckoutSection.tsx client/src/components/checkout/CheckoutSection.tsx
// The white numbered card around each part of the checkout: "① Contact Information / Order invoice & dispatch updates..."

// STEP 38 (part 3): A checkout section

import type { ReactNode } from "react";

type CheckoutSectionProps = {
  number: number;
  title: string;
  subtitle: string;
  badge?: ReactNode; // the small note on the right, e.g. "✓ Verified Customer"
  children: ReactNode;
};

const CheckoutSection = ({
  number,
  title,
  subtitle,
  badge,
  children,
}: CheckoutSectionProps) => {
  const id = `checkout-step-${number}`;
  return (
    <section
      aria-labelledby={id}
      className="overflow-hidden rounded-3xl bg-surface shadow-card"
    >
      <header className="flex items-start justify-between gap-4 border-b border-line bg-panel/60 px-6 py-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-light font-semibold text-primary"
          >
            {number}
          </span>
          <div>
            <h2 id={id} className="text-xl leading-7 font-semibold text-ink">
              {title}
            </h2>
            <p className="text-sm text-ink-soft">{subtitle}</p>
          </div>
        </div>
        {badge}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
};

export default CheckoutSection;
