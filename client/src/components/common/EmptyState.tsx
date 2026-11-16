// EmptyState.tsx client/src/components/common/EmptyState.tsx
// The friendly "nothing here" box: an icon, a title, a sentence, and an optional button.
// Used when a search finds nothing (STEP 34), an empty cart (STEP 36), no orders yet (STEP 40)...
//   <EmptyState icon={MdSearchOff} title="No products found" text="Try another word." action={<button>...</button>} />

// STEP 34 (part 2): The empty state

import type { ReactNode } from "react";
import type { IconType } from "react-icons";

type EmptyStateProps = {
  icon: IconType;
  title: string;
  text?: string;
  action?: ReactNode;
};

const EmptyState = ({ icon: Icon, title, text, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-surface px-6 py-16 text-center shadow-card">
      <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <Icon size={32} aria-hidden="true" />
      </span>
      <h2 className="text-xl leading-7 font-bold text-ink">{title}</h2>
      {text && (
        <p className="mt-2 max-w-100 text-[15px] leading-6 text-ink-soft">
          {text}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
