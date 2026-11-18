// TagInput.tsx client/src/components/admin/TagInput.tsx
// "Taxonomy & Tags" (design: Edit Product): the tags as chips with an ×, and a box to type a new one + Enter.
// Tags matter: the Home page finds products by tag (e.g. "flash-deal", "todays-deal", STEP 33).

// STEP 42 (part 5): The tag input

import { useState, type KeyboardEvent } from "react";
import { MdAdd, MdClose } from "react-icons/md";

// The same tidy-up the server does (server STEP 25), so the chip shows what will be saved: "Flash Deal" -> "flash-deal"
const toTag = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type TagInputProps = { tags: string[]; onChange: (tags: string[]) => void };

const TagInput = ({ tags, onChange }: TagInputProps) => {
  const [text, setText] = useState("");

  const add = () => {
    const tag = toTag(text);
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setText("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault(); // Enter would submit the whole form; "," would be typed
      add();
    } else if (event.key === "Backspace" && text === "" && tags.length > 0) {
      onChange(tags.slice(0, -1)); // Backspace in an empty box removes the last chip
    }
  };

  return (
    <div>
      {tags.length > 0 ? (
        <ul aria-label="Tags" className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="flex items-center gap-1 rounded-full bg-primary-light py-1 pr-1.5 pl-3 text-sm font-semibold text-primary-hover"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((item) => item !== tag))}
                aria-label={`Remove tag ${tag}`}
                className="flex size-5 items-center justify-center rounded-full hover:bg-primary/15"
              >
                <MdClose size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-muted">No tags yet.</p>
      )}

      <div className="flex gap-2">
        <label htmlFor="tag-input" className="sr-only">
          New tag
        </label>
        <input
          id="tag-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type tag and press enter..."
          className="h-11 min-w-0 flex-1 rounded-xl bg-field px-4 text-sm outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={add}
          aria-label="Add tag"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line text-ink hover:bg-field"
        >
          <MdAdd size={20} />
        </button>
      </div>
    </div>
  );
};

export default TagInput;
