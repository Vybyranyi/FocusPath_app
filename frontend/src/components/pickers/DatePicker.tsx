import { cn } from "@/lib/utils";

export interface IDatePicker {
  date: Date | string | number;
  active?: boolean;
  error?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function DatePicker({
  date,
  active,
  error,
  disabled,
  onClick,
}: IDatePicker) {
  const parsed = new Date(date);
  const day = parsed.getDate();
  const weekday = weekdays[parsed.getDay()];

  const isActiveError = active && error;

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        "flex flex-col items-center justify-center h-16 rounded-2xl cursor-pointer",
        "bg-base-white transition-all duration-150",
        active && "active",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        active
          ? isActiveError
            ? "ring-2 ring-inset ring-error **:text-error"
            : "ring-2 ring-inset ring-primary-blue **:text-primary-blue"
          : "border border-primary-black-10",
      )}
    >
      <h6>{day}</h6>
      <span className={cn("chip", !active && "text-primary-black-40")}>
        {weekday}
      </span>
    </div>
  );
}
