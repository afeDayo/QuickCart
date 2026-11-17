// dates.ts client/src/utils/dates.ts
// Dates from the server arrive as text ("2026-10-24T09:14:00.000Z"). These show them the way the designs do.

// STEP 38 (part 1): Dates

// "October 24, 2026"
export const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

// "Oct 24, 2026"
export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// "Oct 24, 10:14 AM"
export const shortDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

// "10:14 AM"
export const timeOnly = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
