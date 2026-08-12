import { Emoji } from "react-apple-emojis";
import { cn } from "@/lib/utils";

export interface IIconButtonProps {
  /**
   * The button's accessible name. Required, not optional: every one of these
   * renders nothing but an image, so without it a screen reader announces
   * "button" and nothing else — which is what "back" sounded like on four
   * screens.
   */
  label: string;
  emoji?: string;
  icon?: string;
  size: "small" | "medium" | "large";
  onClick?: () => void;
  show_dot?: boolean;
  type?: "button" | "submit";
}

// Every step now clears the 44px minimum. The old scale topped out at 48 and
// started at 36, and the size actually used in the week strip was 40.
const sizeMap = {
  small: { btn: "w-11 h-11 rounded-xl", media: "w-[18px] h-[18px]" },
  medium: { btn: "w-12 h-12 rounded-2xl", media: "w-5 h-5" },
  large: { btn: "w-14 h-14 rounded-2xl", media: "w-6 h-6" },
};

export default function IconButton({
  label,
  emoji,
  icon,
  size,
  onClick,
  show_dot,
  type = "button",
}: IIconButtonProps) {
  const { btn, media } = sizeMap[size];

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative inline-flex items-center justify-center shrink-0",
        "bg-surface border border-line",
        "transition-colors duration-(--duration-base)",
        "hover:bg-accent-soft hover:border-accent",
        btn,
      )}
    >
      {emoji && <Emoji name={emoji} className={media} />}
      {icon && <img src={icon} alt="" aria-hidden className={cn(media, "icon-adaptive")} />}
      {show_dot && (
        <span
          className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full"
          aria-hidden
        />
      )}
    </button>
  );
}
