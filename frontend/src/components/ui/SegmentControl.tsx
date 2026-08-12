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
}

export default function SegmentControl({
  segments,
  defaultSelectedId,
  onSelect,
}: ISegmentControl) {
  const [selectedId, setSelectedId] = useState(defaultSelectedId);

  const handleClick = (id: string) => {
    setSelectedId(id);
    onSelect?.(id);
  };

  return (
    <div className="flex w-full bg-line rounded-2xl p-0.5">
      {segments.map((segment) => (
        <p
          key={segment.id}
          onClick={() => handleClick(segment.id)}
          className={cn(
            "body-bold flex-1 text-center py-1 rounded-[14px] cursor-pointer",
            "transition-all duration-200",
            selectedId === segment.id
              ? "bg-surface text-accent"
              : "text-ink-2",
          )}
        >
          {segment.label}
        </p>
      ))}
    </div>
  );
}
