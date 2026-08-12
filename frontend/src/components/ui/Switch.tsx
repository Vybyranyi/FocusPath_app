import { cn } from "@/lib/utils";
import * as SwitchPrimitive from "@radix-ui/react-switch";

export interface ISwitch {
  disabled?: boolean;
  toggled?: boolean;
  onClick?: () => void;
}

export default function Switch({ toggled, onClick, disabled }: ISwitch) {
  return (
    <SwitchPrimitive.Root
      checked={toggled}
      onCheckedChange={() => onClick?.()}
      disabled={disabled}
      className={cn(
        "w-12 h-7 rounded-full p-[3.5px]",
        "flex items-center cursor-pointer",
        "transition-colors duration-300 ease-in-out",
        "data-[state=checked]:bg-success",
        "data-[state=unchecked]:bg-line",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block w-[21px] h-[21px] rounded-full bg-white",
          "shadow-small",
          "transition-transform duration-300 ease-in-out",
          "data-[state=checked]:translate-x-5",
          "data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
