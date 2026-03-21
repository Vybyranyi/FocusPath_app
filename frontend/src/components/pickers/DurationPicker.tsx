import Switch from "@components/ui/Switch";
import { cn } from "@/lib/utils";

export interface IDurationPickerProps {
  aiEnabled: boolean;
  duration: string;
  onAiToggle: () => void;
  onDurationChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDurationBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export default function DurationPicker({
  aiEnabled,
  duration,
  onAiToggle,
  onDurationChange,
  onDurationBlur,
  error,
  disabled,
}: IDurationPickerProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="chip mb-1">Choose the number of days</p>

      <div className="bg-base-white ring-card rounded-2xl p-[18px_16px] flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="alternative text-primary-black-40 font-normal flex-1">
            Let AI determine the optimal number of days
          </p>
          <Switch
            toggled={aiEnabled}
            onClick={onAiToggle}
            disabled={disabled}
          />
        </div>

        {!aiEnabled && (
          <input
            type="number"
            min="1"
            max="365"
            placeholder="Enter number of days (1-365)"
            value={duration}
            onChange={onDurationChange}
            onBlur={onDurationBlur}
            disabled={disabled}
            className={cn(
              "h-8 bg-s-darkblue-10 rounded-xl px-3",
              "text-xs font-normal leading-4 text-primary-black",
              "border border-transparent transition-all duration-200 outline-none",
              "placeholder:text-primary-black-40",
              "focus:border-primary-blue focus:bg-base-white",
              "disabled:cursor-not-allowed disabled:opacity-60",
              error && "border-error",
            )}
          />
        )}
      </div>

      {error && <p className="alternative text-error">{error}</p>}
    </div>
  );
}
