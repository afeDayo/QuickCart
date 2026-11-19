// UnsavedChangesBar.tsx client/src/components/admin/UnsavedChangesBar.tsx
// The dark bar stuck to the bottom of the product form (design: Edit Product):
// "● Unsaved Modifications Detected .......... Discard  [Save & Publish Product]"

// STEP 42 (part 7): The save bar

import { MdSave } from "react-icons/md";

type UnsavedChangesBarProps = {
  dirty: boolean; // anything changed since the form opened?
  saving: boolean;
  saveLabel: string; // "Save & Publish Product", "Save Draft", "Schedule Product"
  note: string; // the small second line
  error?: string; // the server's answer when saving fails, e.g. "Please choose a category."
  onDiscard: () => void;
};

const UnsavedChangesBar = ({
  dirty,
  saving,
  saveLabel,
  note,
  error,
  onDiscard,
}: UnsavedChangesBarProps) => {
  return (
    // sticky bottom-4: it rides along the bottom of the screen while you scroll the form
    <div className="sticky bottom-4 z-10 rounded-2xl bg-navy px-5 py-4 text-white shadow-lg max-sm:px-4">
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-danger px-4 py-2 text-sm font-medium"
        >
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`size-2.5 shrink-0 rounded-full ${dirty ? "bg-mint" : "bg-white/40"}`}
          />
          <div>
            <p className="font-semibold">
              {dirty ? "Unsaved Modifications Detected" : "No changes yet"}
            </p>
            <p className="hidden text-sm text-white/70 sm:block">{note}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3 max-sm:w-full">
          <button
            type="button"
            onClick={onDiscard}
            disabled={!dirty || saving}
            className="h-11 rounded-xl px-4 font-semibold hover:bg-white/10 disabled:opacity-40 max-sm:px-3"
          >
            Discard
          </button>
          {/* type="submit": this button submits the <form> it's inside */}
          <button
            type="submit"
            disabled={saving}
            className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold whitespace-nowrap max-sm:flex-1 max-sm:justify-center max-sm:px-3 max-sm:text-sm hover:bg-primary-hover disabled:opacity-60"
          >
            <MdSave size={20} aria-hidden="true" />
            {saving ? "Saving..." : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesBar;
