// CategoryForm.tsx client/src/components/admin/CategoryForm.tsx
// The small form for adding or editing a category: its name and its icon (picked from the icons the shop can show).
// Used twice on the Categories page: "Add Category" and each card's Edit.

// STEP 44 (part 4): The category form

import { useState, type FormEvent } from "react";
import { categoryIcons } from "../../utils/categoryIcons";
import TextInput from "../form/TextInput";

type CategoryFormProps = {
  initialName?: string;
  initialIcon?: string;
  submitLabel: string; // "Add Category" or "Save"
  onSubmit: (name: string, icon: string) => Promise<void>; // throws with the server's message when it fails
  onCancel: () => void;
};

const CategoryForm = ({
  initialName = "",
  initialIcon = "category",
  submitLabel,
  onSubmit,
  onCancel,
}: CategoryFormProps) => {
  const [name, setName] = useState(initialName);
  const [icon, setIcon] = useState(initialIcon);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Please enter the category name.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(name.trim(), icon);
    } catch (err) {
      setError((err as Error).message); // e.g. "There is already a category called 'Books'."
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextInput
        label="Category name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setError("");
        }}
        error={error}
        placeholder="e.g. Toys & Games"
        maxLength={40}
      />

      {/* A group of radio buttons that look like icon tiles. fieldset + legend = the group's label for screen readers. */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Icon</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryIcons).map(([iconName, Icon]) => (
            <label
              key={iconName}
              title={iconName}
              className={`flex size-11 cursor-pointer items-center justify-center rounded-xl border-2 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-primary/40 ${
                icon === iconName
                  ? "border-primary bg-primary-light text-primary-hover"
                  : "border-transparent bg-field text-ink-soft hover:text-ink"
              }`}
            >
              <input
                type="radio"
                name="category-icon"
                value={iconName}
                checked={icon === iconName}
                onChange={() => setIcon(iconName)}
                className="sr-only"
              />
              <Icon size={22} aria-hidden="true" />
              <span className="sr-only">{iconName.replace("_", " ")}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-xl bg-primary-hover px-5 font-semibold text-white hover:bg-primary disabled:opacity-60"
        >
          {saving ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-xl px-4 font-semibold text-ink-soft hover:bg-field"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
