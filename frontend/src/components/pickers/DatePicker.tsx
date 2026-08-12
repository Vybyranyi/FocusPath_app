import { memo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface IDatePicker {
  date: Date | string | number;
  active?: boolean;
  error?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function DatePicker({ date, active, error, disabled, onClick }: IDatePicker) {
  const parsed = new Date(date);
  const day = parsed.getDate();
  const weekday = weekdays[parsed.getDay()];

  const isActiveError = active && error;

  return (
    <button
      type="button"
      // The cell used to be a `<div onClick>`, so the week strip and the month
      // grid could not be reached or operated from the keyboard at all, and
      // the day number was wrapped in an `<h6>` — a screen reader read
      // "heading level 6, 14" in the middle of a date grid.
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={active}
      // "4" on its own says nothing out of context; the full date does.
      aria-label={format(parsed, "EEEE, d MMMM yyyy")}
      className={cn(
        "flex flex-col items-center justify-center w-full h-16 rounded-2xl cursor-pointer",
        "bg-surface transition-colors duration-(--duration-fast)",
        disabled && "opacity-40 cursor-not-allowed",
        active
          ? isActiveError
            ? "ring-2 ring-inset ring-danger **:text-danger"
            : "ring-2 ring-inset ring-accent **:text-accent"
          : "border border-line",
      )}
    >
      <span className="display-6" aria-hidden>
        {day}
      </span>
      <span className={cn("chip", !active && "text-ink-muted")} aria-hidden>
        {weekday}
      </span>
    </button>
  );
}

/**
 * Memoised: the month grid renders up to 42 of these, and the parent re-renders
 * on every navigation of the week strip above it.
 */
export default memo(DatePicker);
