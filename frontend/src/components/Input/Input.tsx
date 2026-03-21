import eye_show from "@assets/images/icons/eye_show.svg";
import eye_hide from "@assets/images/icons/eye_hide.svg";
import remove_cross from "@assets/images/icons/remove_cross.svg";
import React, { useState } from "react";
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
}: IInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [inputType, setInputType] = useState<IInputProps["type"]>(
    type === "date" ? "text" : type,
  );

  const handleFocus = () => {
    if (type === "date") setInputType("date");
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (type === "date" && !value) setInputType("text");
    onBlur?.(e);
  };

  const handleClear = () => {
    onChange?.({
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const currentType =
    type === "password" ? (isPasswordVisible ? "text" : "password") : inputType;

  return (
    <div className={cn("w-full min-w-fit", disabled && "opacity-70")}>
      <p className={cn("chip mb-2", disabled && "text-primary-black-60")}>
        {label}
      </p>

      <div className="relative">
        <input
          type={currentType}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "w-full h-12 pr-8 text-[18px] font-medium leading-6 bg-transparent",
            "ring-input focus:ring-input-focus outline-none",
            "placeholder:text-primary-black-20",
            "disabled:cursor-not-allowed",
            error && "ring-input-error",
          )}
        />

        <div className="absolute right-0 top-[52%] -translate-y-1/2 flex items-center gap-1">
          {type === "password" && (
            <button
              type="button"
              onClick={() => setIsPasswordVisible((v) => !v)}
            >
              <img
                src={isPasswordVisible ? eye_hide : eye_show}
                className="w-6 h-6 cursor-pointer"
                alt="Toggle password visibility"
              />
            </button>
          )}
          {value && (
            <button type="button" onClick={handleClear}>
              <img
                src={remove_cross}
                className="w-6 h-6 cursor-pointer"
                alt="Clear input"
              />
            </button>
          )}
        </div>
      </div>

      {error && <p className="alternative text-error mt-1">{error}</p>}
    </div>
  );
}
