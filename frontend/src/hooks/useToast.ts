import { useContext } from "react";
import { ToastContext } from "@components/ui/toastContext";

/**
 * Lives apart from the provider so the component module exports only
 * components — Fast Refresh gives up on a file that mixes the two.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }
  return context;
}
