import React from "react";
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
  return (
    <div className={cn("w-full min-w-fit", disabled && "opacity-70")}>
      <p className={cn("chip mb-2", disabled && "text-ink-2")}>
        {label}
      </p>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            "w-full h-12 pr-8 text-[18px] font-medium leading-6 appearance-none",
            "bg-transparent border-none outline-none",
            "ring-input focus:ring-input-focus focus-visible:outline-none",
            "disabled:cursor-not-allowed",
            !value && "placeholder text-ink-faint",
            error && "ring-input-danger",
          )}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-canvas text-ink"
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom arrow */}
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-ink-2">
          ▼
        </span>
      </div>

      <FieldError message={error} />
    </div>
  );
}
