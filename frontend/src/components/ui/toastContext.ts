import { createContext } from "react";

export type ToastTone = "success" | "danger";

export interface ToastContextValue {
  /** Show a message and announce it. Returns nothing; toasts dismiss themselves. */
  notify: (message: string, tone?: ToastTone) => void;
}

/**
 * Kept apart from the provider so the component module exports only
 * components — Fast Refresh gives up on a file that mixes the two.
 */
export const ToastContext = createContext<ToastContextValue | null>(null);
