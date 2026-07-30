import { useState, type ReactNode } from "react";
import * as Popover from "@radix-ui/react-popover";
import FieldError from "@components/ui/FieldError";
import type { Option } from "@/types/ui";
import { cn } from "@/lib/utils";

export interface OptionPickerProps<TValue extends string> {
  options: readonly Option<TValue>[];
  value?: string;
  onChange?: (value: TValue) => void;
  /** Shown under the selection, naming what is being chosen. */
  caption: string;
  /** Stands in for the label while nothing is selected. */
  placeholder: string;
  /** The small square shown for an option, and for the empty state when undefined. */
  renderPreview: (option: Option<TValue> | undefined) => ReactNode;
  disabled?: boolean;
  error?: string;
  /** The dropdown's height. A list of nine colours wants less room than forty icons. */
  maxHeightClassName?: string;
}

/**
 * A dropdown of options, each shown with a preview of what picking it does.
 *
 * Colours and icons were two copies of this component whose markup matched
 * character for character apart from the preview and two strings. Both also
 * carried an onBlur prop that neither ever read.
 */
export default function OptionPicker<TValue extends string>({
  options,
  value,
  onChange,
  caption,
  placeholder,
  renderPreview,
  disabled,
  error,
  maxHeightClassName = "max-h-64",
}: OptionPickerProps<TValue>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="flex flex-col gap-1">
      <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
        <Popover.Trigger asChild>
          <div
            className={cn(
              "flex items-center gap-3 bg-base-white p-4 rounded-2xl",
              "ring-card transition-all duration-200 cursor-pointer",
              "hover:ring-card-hover",
              open && "ring-card-focus",
              disabled && "cursor-not-allowed opacity-60 hover:ring-card",
            )}
          >
            {renderPreview(selected)}
            <div>
              <p className="body-bold">{selected?.label ?? placeholder}</p>
              <p className="alternative text-primary-black-40">{caption}</p>
            </div>
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            sideOffset={6}
            align="start"
            className={cn(
              "bg-base-white rounded-2xl ring-card p-2 z-50",
              maxHeightClassName,
              "overflow-y-auto w-(--radix-popover-trigger-width)",
              "shadow-medium",
              "animate-in fade-in-0 zoom-in-95 duration-150",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer",
                  "transition-colors duration-150 hover:bg-primary-black-10",
                  value === option.value && "bg-primary-blue-10",
                )}
              >
                {renderPreview(option)}
                <p className="body-bold">{option.label}</p>
              </button>
            ))}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <FieldError message={error} />
    </div>
  );
}

/** The square frame both pickers draw their preview inside. */
export const PreviewFrame = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "w-9 h-9 rounded-xl shrink-0 inline-flex items-center justify-center",
      "border border-primary-black-10",
      className,
    )}
  >
    {children}
  </span>
);
