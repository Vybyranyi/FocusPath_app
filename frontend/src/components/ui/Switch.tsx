import { cn } from "@/lib/utils";
import * as SwitchPrimitive from "@radix-ui/react-switch";

export interface ISwitch {
  /** The switch renders no text of its own, so it needs a name given to it. */
  label: string;
  disabled?: boolean;
  toggled?: boolean;
  onClick?: () => void;
}

export default function Switch({ label, toggled, onClick, disabled }: ISwitch) {
  return (
    <SwitchPrimitive.Root
      checked={toggled}
      onCheckedChange={() => onClick?.()}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "w-12 h-7 rounded-full p-[3.5px]",
        "flex items-center cursor-pointer",
        "transition-colors duration-(--duration-slow) ease-in-out",
        "data-[state=checked]:bg-success",
        "data-[state=unchecked]:bg-line-strong",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block w-[21px] h-[21px] rounded-full bg-on-brand",
          "shadow-inset",
          "transition-transform duration-(--duration-slow) ease-in-out",
          "data-[state=checked]:translate-x-5",
          "data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
