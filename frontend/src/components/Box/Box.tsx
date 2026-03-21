import { Emoji } from "react-apple-emojis";
import { cn } from "@/lib/utils";

export interface IBoxProps {
  emoji: string;
  title: string;
  text: string;
  color:
    | "white"
    | "orange"
    | "blue"
    | "lightblue"
    | "red"
    | "yellow"
    | "green"
    | "purple"
    | "teal"
    | "gradient";
  onClick?: () => void;
}

const colorMap: Record<IBoxProps["color"], string> = {
  white: "bg-base-white",
  orange: "bg-s-orange-20",
  blue: "bg-primary-blue-20",
  lightblue: "bg-blue-info-20",
  red: "bg-error-20",
  yellow: "bg-warning-20",
  green: "bg-success-20",
  purple: "bg-s-purple-20",
  teal: "bg-s-teal-20",
  gradient: "bg-blue-gradient",
};

export default function Box({ emoji, title, text, color, onClick }: IBoxProps) {
  const isGradient = color === "gradient";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-32 h-25.5 rounded-2xl py-3 px-4 text-left cursor-pointer transition-opacity duration-200 hover:opacity-90",
        colorMap[color],
      )}
    >
      <span className="inline-block w-8 h-8 p-1.5 rounded-xl bg-base-white mb-2">
        <Emoji name={emoji} className="w-full h-full" />
      </span>
      <p className={cn("body-bold", isGradient && "text-base-white")}>
        {title}
      </p>
      <p
        className={cn(
          "alternative mt-0.5",
          isGradient ? "text-base-white" : "text-primary-black-60",
        )}
      >
        {text}
      </p>
    </button>
  );
}
