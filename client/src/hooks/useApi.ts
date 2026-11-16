// useApi.ts client/src/hooks/useApi.ts
// Load something from the server when a component appears, and keep track of loading and errors:
//   const { data, loading, error, reload } = useApi<CategoriesResponse>("/categories");
// When the path changes (e.g. the Shop page's filters), it loads again by itself.

// STEP 30 (part 3): A hook for loading data

import { useEffect, useState } from "react";
import { api } from "../utils/api";

// The last answer, labelled with WHICH request it answers ("/categories#0")
type Result<T> = { key: string; data?: T; error?: string };

// path = null means "don't load anything yet" (e.g. a product page waiting for its id)
export const useApi = <T>(path: string | null) => {
  const [reloadCount, setReloadCount] = useState(0); // the "Try again" button adds 1, which loads again
  const [result, setResult] = useState<Result<T> | null>(null);

  // A label for the request we want right now. A new path or a reload = a new label = load again.
  const key = path === null ? null : `${path}#${reloadCount}`;

  useEffect(() => {
    if (path === null || key === null) {
      return;
    }

    // If the component disappears, or the path changes before the answer arrives, cancel this request.
    // Otherwise a slow old answer could arrive last and replace the new one.
    const controller = new AbortController();

    api<T>(path, { signal: controller.signal })
      .then((data) => {
        setResult({ key, data });
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setResult({ key, error: err.message });
        }
      });

    // React calls this "clean-up" function before the next load and when the component disappears
    return () => {
      controller.abort();
    };
  }, [path, key]);

  // Still loading = the answer we have isn't for the request we want yet.
  // (Nothing is stored for "loading": it's worked out from what we have, so it can never be out of date.)
  const loading = key !== null && result?.key !== key;

  return {
    data: result?.data ?? null, // while a NEW request loads, the previous data stays on screen
    error: !loading ? (result?.error ?? null) : null,
    loading,
    reload: () => {
      setReloadCount((count) => count + 1);
    },
  };
};
