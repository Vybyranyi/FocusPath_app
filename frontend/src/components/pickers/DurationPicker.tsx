import FieldError from "@components/ui/FieldError";
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

      <div className="bg-surface ring-card rounded-2xl p-[18px_16px] flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="alternative text-ink-muted font-normal flex-1">
            Let AI determine the optimal number of days
          </p>
          <Switch
            label="Let AI choose the number of days"
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
              "h-8 bg-surface-2 rounded-xl px-3",
              "text-xs font-normal leading-4 text-ink",
              "border border-transparent transition-all duration-200 outline-none",
              "placeholder:text-ink-muted",
              "focus:border-accent focus:bg-surface",
              "disabled:cursor-not-allowed disabled:opacity-60",
              error && "border-danger",
            )}
          />
        )}
      </div>

      <FieldError message={error} className="mt-0" />
    </div>
  );
}
