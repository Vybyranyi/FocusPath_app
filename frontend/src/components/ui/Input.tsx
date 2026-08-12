import eye_show from "@assets/images/icons/eye_show.svg";
import eye_hide from "@assets/images/icons/eye_hide.svg";
import remove_cross from "@assets/images/icons/remove_cross.svg";
import React, { useId, useState } from "react";
import FieldError from "@components/ui/FieldError";
import { cn } from "@/lib/utils";

export interface IInputProps {
  label: string;
  placeholder: string;
  type: "text" | "email" | "password" | "date";
  disabled?: boolean;
  error?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Called by the clear button. Without it the button is not rendered. */
  onClear?: () => void;
}

export default function Input({
  label,
  placeholder,
  type,
  disabled,
  error,
  value,
  onChange,
  onBlur,
  onClear,
}: IInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [inputType, setInputType] = useState<IInputProps["type"]>(
    type === "date" ? "text" : type,
  );

  // A real label needs a real id. There was no `<label>` anywhere in this app,
  // so every field announced itself as an unnamed "edit text".
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const handleFocus = () => {
    if (type === "date") setInputType("date");
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (type === "date" && !value) setInputType("text");
    onBlur?.(e);
  };

  const currentType =
    type === "password" ? (isPasswordVisible ? "text" : "password") : inputType;

  return (
    <div className={cn("w-full min-w-fit", disabled && "opacity-70")}>
      <label
        htmlFor={inputId}
        className={cn("field-label block mb-1.5", disabled && "text-ink-2")}
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={currentType}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full h-12 pr-16 text-[1.0625rem] font-medium leading-6 bg-transparent",
            "ring-input focus:ring-input-focus",
            "placeholder:text-ink-muted",
            "disabled:cursor-not-allowed",
            error && "ring-input-error",
          )}
        />

        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
          {type === "password" && (
            <button
              type="button"
              onClick={() => setIsPasswordVisible((v) => !v)}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              aria-pressed={isPasswordVisible}
              className="inline-flex items-center justify-center w-11 h-11 rounded-lg cursor-pointer"
            >
              <img
                src={isPasswordVisible ? eye_hide : eye_show}
                alt=""
                aria-hidden
                className="w-6 h-6 icon-adaptive"
              />
            </button>
          )}
          {value && onClear && (
            <button
              type="button"
              onClick={onClear}
              aria-label={`Clear ${label}`}
              className="inline-flex items-center justify-center w-11 h-11 rounded-lg cursor-pointer"
            >
              <img
                src={remove_cross}
                alt=""
                aria-hidden
                className="w-6 h-6 icon-adaptive"
              />
            </button>
          )}
        </div>
      </div>

      <FieldError id={errorId} message={error} />
    </div>
  );
}
