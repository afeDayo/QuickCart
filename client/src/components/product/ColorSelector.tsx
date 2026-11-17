// ColorSelector.tsx client/src/components/product/ColorSelector.tsx
// "Color: Midnight Black" and a pill per colour, with a dot of that colour. One can be chosen (radio buttons).

// STEP 35 (part 7): The colour picker

import type { ProductColor } from "../../types/api";

type ColorSelectorProps = {
  colors: ProductColor[];
  value: string;
  onChange: (name: string) => void;
};

const ColorSelector = ({ colors, value, onChange }: ColorSelectorProps) => {
  return (
    // <fieldset> + <legend>: the HTML way to group radio buttons under one question
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-ink">
        Color: <span className="text-primary-hover">{value}</span>
      </legend>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <label
            key={color.name}
            // has-checked: Tailwind styles the label when the radio inside it is checked, no extra state needed
            className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-line-soft px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-primary-light has-checked:border-primary has-checked:bg-primary-light/40 has-checked:text-ink has-focus-visible:ring-2 has-focus-visible:ring-primary/40"
          >
            <input
              type="radio"
              name="color"
              value={color.name}
              checked={value === color.name}
              onChange={() => onChange(color.name)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className="size-4 rounded-full border border-black/10"
              style={{ backgroundColor: color.hex }}
            />
            {color.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default ColorSelector;

