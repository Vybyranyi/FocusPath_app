import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ToastContext, type ToastTone } from "@components/ui/toastContext";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

const DISMISS_AFTER = 4000;

/**
 * One place for "that worked" and "that did not".
 *
 * Results used to be reported four different ways: a line of text under a card
 * that disappeared after three seconds, a message under a form, a native
 * `alert`, and — for deleting a habit, signing out, or ticking a step —
 * nothing at all. None of them were announced, so a screen reader user got no
 * confirmation that anything had happened.
 *
 * The region is `role="status"`, which announces politely without stealing
 * focus, and it is rendered whether or not it has children: a live region has
 * to be in the document *before* the text arrives, or the change goes
 * unnoticed.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const notify = useCallback((message: string, tone: ToastTone = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(
      () => setToasts((current) => current.filter((t) => t.id !== id)),
      DISMISS_AFTER,
    );
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        role="status"
        aria-live="polite"
        className="fixed z-[300] inset-x-0 bottom-24 md:bottom-6 flex flex-col items-center gap-2 px-4 pointer-events-none"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.p
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "body-bold max-w-96 px-4 py-3 rounded-2xl shadow-lifted border",
                toast.tone === "success"
                  ? "bg-success-soft text-success border-success/30"
                  : "bg-danger-soft text-danger border-danger/30",
              )}
            >
              {toast.message}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
