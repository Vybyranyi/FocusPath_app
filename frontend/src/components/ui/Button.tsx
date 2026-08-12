import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  [
    "relative overflow-hidden",
    "w-full min-w-fit inline-flex items-center justify-center gap-1",
    "transition-all duration-(--duration-base) cursor-pointer",
    // icons and text float above the overlay
    "[&_img]:relative [&_img]:z-10 [&_img]:h-5 [&_img]:w-5",
    "[&_svg]:relative [&_svg]:z-10",
    "[&>span]:relative [&>span]:z-10",
    "disabled:cursor-not-allowed",
    // shared overlay — controls hover/active separately from the icon layer
    "before:content-[''] before:absolute before:inset-0",
    "before:transition-opacity before:duration-(--duration-base) before:opacity-0",
    "hover:before:opacity-100 active:before:opacity-100",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-accent",
          "before:bg-white/25",
          "active:before:bg-black/15",
          "disabled:bg-accent-soft",
          "[&>span]:text-on-accent",
          "disabled:[&>span]:text-ink-muted",
        ],
        secondary: [
          "bg-surface",
          "before:bg-ink/5",
          "active:before:bg-ink/10",
          "disabled:bg-canvas",
          "[&>span]:text-ink",
          "disabled:[&>span]:text-ink-muted",
        ],
        outline: [
          "bg-transparent ring-card",
          "before:bg-accent-soft",
          "active:before:bg-brand-blue-20",
          "disabled:shadow-[inset_0_0_0_1px_var(--line-strong)]",
          "[&>span]:text-ink-2",
          "disabled:[&>span]:text-ink-muted",
        ],
        ai: ["btn-ai", "[&>span]:text-on-brand", "before:bg-white/10"],
      },
      size: {
        // Every step clears the 44px minimum target height.
        small: "min-h-11 py-2 rounded-[18px]",
        medium: "min-h-12 py-3 rounded-[22px]",
        large: "min-h-14 py-4 rounded-3xl",
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
  /** Drawn ahead of the label. Use for icons that must follow the text colour. */
  iconNode?: ReactNode;
  /** Overrides the accessible name when the visible label is not enough. */
  label?: string;
  /** Marks this as the current page when the button is acting as navigation. */
  current?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

export default function Button({
  type = "primary",
  isActive,
  size,
  disabled,
  htmlType = "button",
  icon,
  iconNode,
  label,
  current,
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
      aria-label={label}
      aria-current={current ? "page" : undefined}
      onClick={onClick}
    >
      {iconNode}
      {icon && <img src={icon} alt="" aria-hidden />}
      <span className="body-bold">{children}</span>
    </button>
  );
}
