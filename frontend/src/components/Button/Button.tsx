import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  [
    "w-full min-w-fit inline-flex items-center justify-center gap-1",
    "transition-all duration-200 cursor-pointer",
    "[&_img]:h-5 [&_img]:w-5",
    "disabled:cursor-not-allowed",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary-blue",
          "hover:bg-primary-blue-80",
          "disabled:bg-primary-blue-60",
          "[&>span]:text-base-white",
          "disabled:[&>span]:text-primary-black-20",
        ],
        secondary: [
          "bg-base-white",
          "hover:bg-s-darkblue-20",
          "disabled:bg-base-bg",
          "[&>span]:text-primary-black",
          "disabled:[&>span]:text-primary-black-40",
        ],
        outline: [
          "bg-transparent ring-card",
          "hover:bg-primary-black-10",
          "disabled:shadow-[inset_0_0_0_1px_#CDCDD0]",
          "[&>span]:text-primary-black-60",
          "disabled:[&>span]:text-primary-black-20",
        ],
        ai: ["btn-ai", "[&>span]:text-base-white"],
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
  disabled?: boolean;
  size: "small" | "medium" | "large";
  htmlType?: "button" | "submit" | "reset";
  icon?: string;
  children: string;
  onClick?: () => void;
}

export default function Button({
  type = "primary",
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
      className={cn(buttonVariants({ variant: type, size }))}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <img src={icon} className="hover:bg-white" aria-hidden />}
      <span className="body-bold">{children}</span>
    </button>
  );
}
