import React, { useId } from "react";
import FieldError from "@components/ui/FieldError";
import { cn } from "@/lib/utils";

export interface ISelectOption {
  label: string;
  value: string;
}

export interface ISelectProps {
  label: string;
  placeholder: string;
  options: ISelectOption[];
  disabled?: boolean;
  error?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
}

export default function Select({
  label,
  placeholder,
  options,
  disabled,
  error,
  value,
  onChange,
  onBlur,
}: ISelectProps) {
  const selectId = useId();
  const errorId = `${selectId}-error`;

  return (
    <div className={cn("w-full min-w-fit", disabled && "opacity-70")}>
      <label
        htmlFor={selectId}
        className={cn("field-label block mb-1.5", disabled && "text-ink-2")}
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full h-12 pr-8 text-[1.0625rem] font-medium leading-6 appearance-none",
            "bg-transparent border-none",
            "ring-input focus:ring-input-focus",
            "disabled:cursor-not-allowed",
            // Was `placeholder text-primary-black-20`. The bare `placeholder`
            // is not a utility — it generated nothing, and a test asserted it.
            !value && "text-ink-muted",
            error && "ring-input-error",
          )}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-surface text-ink"
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* An icon rather than a "▼" character, which rendered in whatever the
            reader's font had for it and could not be sized reliably. */}
        <svg
          viewBox="0 0 12 8"
          aria-hidden
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-2 text-ink-2"
        >
          <path
            d="M1 1.5 6 6.5 11 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <FieldError id={errorId} message={error} />
    </div>
  );
}
