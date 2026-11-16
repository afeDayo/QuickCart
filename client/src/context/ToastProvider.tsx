// ToastProvider.tsx client/src/context/ToastProvider.tsx
// Keeps the list of toasts, removes each one after 5 seconds, and draws them (Toaster) on top of every page.

// STEP 32 (part 5): The toast provider

import { useRef, useState, type ReactNode } from "react";
import Toaster from "../components/common/Toaster";
import { ToastContext, type Toast } from "./ToastContext";

const TOAST_SECONDS = 5;

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1); // a counter that survives re-renders without causing one

  const dismissToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const showToast = (toast: Omit<Toast, "id">) => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { ...toast, id }]); // at most 3 on screen
    setTimeout(() => dismissToast(id), TOAST_SECONDS * 1000);
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
