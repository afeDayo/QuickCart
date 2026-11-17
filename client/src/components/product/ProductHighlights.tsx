// ProductHighlights.tsx client/src/components/product/ProductHighlights.tsx
// The 3 feature cards under the photos ("Hybrid Active Noise Cancelling", "Speed Fuel USB-C Charging"...).

// STEP 35 (part 9): Highlights

import type { ProductHighlight } from "../../types/api";
import { getHighlightIcon } from "../../utils/highlightIcons";

// A different soft colour for each card, like the design
const TILES = [
  "bg-primary-light text-primary",
  "bg-info-light text-primary",
  "bg-mint text-forest",
];

const ProductHighlights = ({
  highlights,
}: {
  highlights: ProductHighlight[];
}) => {
  if (highlights.length === 0) return null;

  return (
    <section aria-label="Highlights">
      <ul className="grid gap-6 md:grid-cols-3">
        {highlights.map((highlight, index) => {
          const Icon = getHighlightIcon(highlight.icon);
          return (
            <li
              key={highlight.title}
              className="rounded-3xl bg-surface p-6 shadow-card"
            >
              <span
                className={`mb-4 flex size-11 items-center justify-center rounded-xl ${TILES[index % TILES.length]}`}
              >
                <Icon size={22} aria-hidden="true" />
              </span>
              <h2 className="text-lg leading-6 font-semibold text-ink">
                {highlight.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                {highlight.text}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ProductHighlights;
