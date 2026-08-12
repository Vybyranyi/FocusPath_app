import tick from "@assets/images/icons/tick.svg";
import { Emoji } from "react-apple-emojis";
import { cn } from "@/lib/utils";

export interface ICircleLoader {
  percentages: number;
  emoji?: string;
  isWhite?: boolean;
}

export default function CircleLoader({
  percentages,
  emoji,
  isWhite,
}: ICircleLoader) {
  const size = 36;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentages / 100) * circumference;

  return (
    <span className="relative w-9 h-9 flex items-center justify-center shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={isWhite ? "#AFB4FF" : "#EAECF0"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={isWhite ? "#ffffff" : "#3843FF"}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>

      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        {emoji ? (
          <Emoji name={emoji} className="w-3.5 h-3.5" />
        ) : percentages === 100 ? (
          <img src={tick} alt="done" className="w-3 h-3" />
        ) : (
          <span
            className={cn(
              "alternative",
              isWhite ? "text-on-brand" : "text-ink",
            )}
          >
            {`%${percentages}`}
          </span>
        )}
      </span>
    </span>
  );
}
