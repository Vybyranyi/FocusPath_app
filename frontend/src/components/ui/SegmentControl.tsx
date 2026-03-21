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
  onSelect: (selectedId: string) => void;
}

export default function SegmentControl({
  segments,
  defaultSelectedId,
  onSelect,
}: ISegmentControl) {
  const [selectedId, setSelectedId] = useState(defaultSelectedId);

  const handleClick = (id: string) => {
    setSelectedId(id);
    onSelect(id);
  };

  return (
    <div className="flex w-full bg-primary-black-10 rounded-2xl p-0.5">
      {segments.map((segment) => (
        <p
          key={segment.id}
          onClick={() => handleClick(segment.id)}
          className={cn(
            "body-bold flex-1 text-center py-1 rounded-[14px] cursor-pointer",
            "transition-all duration-200",
            selectedId === segment.id
              ? "bg-base-white text-primary-blue"
              : "text-primary-black-60",
          )}
        >
          {segment.label}
        </p>
      ))}
    </div>
  );
}
