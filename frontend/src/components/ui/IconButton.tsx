import { Emoji } from "react-apple-emojis";
import { cn } from "@/lib/utils";

export interface IIconButtonProps {
  emoji?: string;
  icon?: string;
  size: "small" | "medium" | "large";
  onClick?: () => void;
  show_dot?: boolean;
}

const sizeMap = {
  small: { btn: "w-9 h-9 rounded-xl", media: "w-[18px] h-[18px]" },
  medium: { btn: "w-10 h-10 rounded-2xl", media: "w-5 h-5" },
  large: { btn: "w-12 h-12 rounded-2xl", media: "w-6 h-6" },
};

export default function IconButton({
  emoji,
  icon,
  size,
  onClick,
  show_dot,
}: IIconButtonProps) {
  const { btn, media } = sizeMap[size];

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center",
        "bg-base-white border border-primary-black-10",
        "transition-all duration-200",
        "hover:bg-primary-blue-10 hover:border-primary-blue",
        btn,
      )}
    >
      {emoji && <Emoji name={emoji} className={media} />}
      {icon && <img src={icon} alt="" aria-hidden className="w-6 h-6" />}
      {show_dot && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
      )}
    </button>
  );
}
