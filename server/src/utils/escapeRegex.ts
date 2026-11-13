// escapeRegex.ts server/src/utils/escapeRegex.ts
// Makes user text safe to put inside a regular expression: "3.5mm (black)" -> "3\.5mm \(black\)"
// Without it, "." would match any character and "(" would crash the search.

// STEP 16: The products API (helper)

export const escapeRegex = (text: string) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& = "the character that matched"
};
