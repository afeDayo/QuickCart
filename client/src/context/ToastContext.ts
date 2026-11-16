// ToastContext.ts client/src/context/ToastContext.ts
// Small pop-up messages in the corner ("toasts"), like the design's "Product updated successfully":
//   const { showToast } = useToast();
//   showToast({ type: "error", title: "Only 3 left" });

// STEP 32 (part 4): Toasts

import { createContext, useContext } from "react";

export type Toast = {
  id: number;
  type: "success" | "error" | "info";
  title: string;
  message?: string; // a second, smaller line
};

export type ToastContextValue = {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void; // the id is made for you
  dismissToast: (id: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error(
      "useToast must be used inside <ToastProvider> (see main.tsx)",
    );
  }
  return value;
};
