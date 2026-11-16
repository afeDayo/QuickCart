// Toaster.tsx client/src/components/common/Toaster.tsx
// Draws the toasts in the bottom-right corner (bottom of the screen on phones), like the design's dark
// "Product updated successfully" box. ToastProvider puts it on every page.

// STEP 32 (part 5): The toasts on screen

import {
  MdCheckCircle,
  MdClose,
  MdErrorOutline,
  MdInfoOutline,
} from "react-icons/md";
import { useToast } from "../../context/ToastContext";

const ICONS = {
  success: { icon: MdCheckCircle, color: "text-mint" },
  error: { icon: MdErrorOutline, color: "text-[#ffb4ab]" },
  info: { icon: MdInfoOutline, color: "text-primary-light" },
};

const Toaster = () => {
  const { toasts, dismissToast } = useToast();

  return (
    // aria-live="polite": screen readers read each new toast without interrupting
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-100 flex flex-col items-end gap-3 sm:left-auto"
    >
      {toasts.map((toast) => {
        const { icon: Icon, color } = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-2xl bg-navy px-4 py-3.5 text-white shadow-banner"
          >
            <Icon
              size={22}
              aria-hidden="true"
              className={`mt-px shrink-0 ${color}`}
            />
            <div className="flex-1">
              <p className="text-[15px] leading-5 font-semibold">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-0.5 text-sm leading-5 text-white/75">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Close message"
              className="text-white/70 hover:text-white"
            >
              <MdClose size={20} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toaster;
