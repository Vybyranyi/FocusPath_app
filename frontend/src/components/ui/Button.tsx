import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  [
    "relative overflow-hidden",
    "w-full min-w-fit inline-flex items-center justify-center gap-1",
    "transition-all duration-200 cursor-pointer",
    // icons and text float above the overlay
    "[&_img]:relative [&_img]:z-10 [&_img]:h-5 [&_img]:w-5",
    "[&>span]:relative [&>span]:z-10",
    "disabled:cursor-not-allowed",
    // shared overlay — controls hover/active separately from the icon layer
    "before:content-[''] before:absolute before:inset-0",
    "before:transition-opacity before:duration-200 before:opacity-0",
    "hover:before:opacity-100 active:before:opacity-100",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary-blue",
          "before:bg-white/25",
          "active:before:bg-black/15",
          "disabled:bg-primary-blue-40",
          "[&>span]:text-base-white",
          "disabled:[&>span]:text-primary-black-20",
        ],
        secondary: [
          "bg-base-white",
          "before:bg-primary-black/5",
          "active:before:bg-primary-black/10",
          "disabled:bg-base-bg",
          "[&>span]:text-primary-black",
          "disabled:[&>span]:text-primary-black-40",
        ],
        outline: [
          "bg-transparent ring-card",
          "before:bg-primary-blue-10",
          "active:before:bg-primary-blue-20",
          "disabled:shadow-[inset_0_0_0_1px_#CDCDD0]",
          "[&>span]:text-primary-black-60",
          "disabled:[&>span]:text-primary-black-20",
        ],
        ai: ["btn-ai", "[&>span]:text-base-white", "before:bg-white/10"],
      },
      size: {
        small: "py-2 rounded-[18px]",
        medium: "py-3 rounded-[22px]",
        large: "py-4 rounded-3xl",
      },
    },
    defaultVariants: { variant: "primary", size: "medium" },
  },
);

export interface IButtonProps extends VariantProps<typeof buttonVariants> {
  type?: "primary" | "secondary" | "outline" | "ai";
  isActive?: boolean;
  disabled?: boolean;
  size: "small" | "medium" | "large";
  htmlType?: "button" | "submit" | "reset";
  icon?: string;
  children: string;
  onClick?: () => void;
}

export default function Button({
  type = "primary",
  isActive,
  size,
  disabled,
  htmlType,
  icon,
  children,
  onClick,
}: IButtonProps) {
  return (
    <button
      type={htmlType}
      className={cn(
        buttonVariants({ variant: type, size }),
        isActive && "before:opacity-100",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <img src={icon} aria-hidden />}
      <span className="body-bold">{children}</span>
    </button>
  );
}
