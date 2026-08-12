import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Segment {
  id: string;
  label: string;
  notifications?: number;
}

export interface ISegmentControl {
  segments: Segment[];
  defaultSelectedId: string;
  /** Optional: the control already tracks its own selection, so a caller that
   * only needs the visual state can leave this out. */
  onSelect?: (selectedId: string) => void;
  /** Names the group for a screen reader. */
  label?: string;
  disabled?: boolean;
}

/**
 * A one-of-many choice. The segments used to be `<p onClick>`: not focusable,
 * deaf to Enter and Space, and with no role. One of the two places this is
 * used is the Build/Quit field on the habit form, so a keyboard user could
 * not create a "quit" habit at all.
 */
export default function SegmentControl({
  segments,
  defaultSelectedId,
  onSelect,
  label,
  disabled,
}: ISegmentControl) {
  const [selectedId, setSelectedId] = useState(defaultSelectedId);

  const handleClick = (id: string) => {
    setSelectedId(id);
    onSelect?.(id);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "flex w-full bg-line rounded-2xl p-0.5",
        disabled && "opacity-60",
      )}
    >
      {segments.map((segment) => {
        const selected = selectedId === segment.id;
        return (
          <button
            key={segment.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => handleClick(segment.id)}
            className={cn(
              "body-bold flex-1 text-center py-1.5 rounded-[14px] cursor-pointer",
              "transition-colors duration-(--duration-base)",
              "disabled:cursor-not-allowed",
              selected ? "bg-surface text-accent" : "text-ink-2",
            )}
          >
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}
