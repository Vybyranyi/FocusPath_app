import { useEffect, useRef, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface IModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** One line under the title saying what this dialog is for. */
  description?: string;
  /** Tints the header and the close button for an irreversible action. */
  tone?: "default" | "danger";
  children: ReactNode;
}

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    aria-hidden
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/**
 * The shape every account dialog takes.
 *
 * There were three different ways to confirm something in this app: the habit
 * sheet, an inline block inside the profile page for deleting an account, and
 * an inline card for changing a password. Two of those were not dialogs at
 * all — no focus trap, no Escape, and the page kept scrolling behind them.
 *
 * The habit sheet stays on its own: it is a bottom sheet on mobile with its
 * own header, menu and progress bar, and fitting it in here would grow this
 * component to serve exactly one caller. What is shared is the behaviour
 * Radix supplies — focus, Escape, scroll lock, labelling — not the markup.
 */
export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  tone = "default",
  children,
}: IModalProps) {
  /**
   * Radix returns focus to its own `Dialog.Trigger` on close. These dialogs are
   * opened from state instead — the page owns `open` — so there is no trigger
   * for it to find, and focus was landing on the document body: a keyboard user
   * closed the dialog and was dropped at the top of the page. Remember what had
   * focus when it opened and put it back.
   */
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) openerRef.current = document.activeElement as HTMLElement | null;
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-ink/60 backdrop-blur-sm"
          />
        </Dialog.Overlay>

        <Dialog.Content
          asChild
          aria-modal="true"
          onCloseAutoFocus={(event) => {
            const opener = openerRef.current;
            if (!opener?.isConnected) return;
            event.preventDefault();
            opener.focus();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "fixed z-[201] bg-surface shadow-ambient",
              "inset-x-0 bottom-0 rounded-t-3xl",
              "md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
              "md:w-full md:max-w-100 md:rounded-3xl",
              "max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <Dialog.Title
                  className={cn(
                    "display-5",
                    tone === "danger" ? "text-danger" : "text-ink",
                  )}
                >
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="body-light text-ink-2">
                    {description}
                  </Dialog.Description>
                )}
              </div>

              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-canvas text-ink-2 hover:bg-line hover:text-ink transition-colors cursor-pointer"
                >
                  <CloseIcon />
                </button>
              </Dialog.Close>
            </div>

            {children}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
