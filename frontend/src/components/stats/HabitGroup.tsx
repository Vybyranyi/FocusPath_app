import HabitRow from "./HabitRow";
import type { Habit } from "@shared/index";

interface HabitGroupProps {
  habits: Habit[];
  type: "build" | "quit";
}

const config = {
  build: { label: "Build habits", dotClass: "bg-primary-blue" },
  quit: { label: "Quit habits", dotClass: "bg-s-orange" },
};

export default function HabitGroup({ habits, type }: HabitGroupProps) {
  if (habits.length === 0) return null;

  const { label, dotClass } = config[type];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
        <p className="chip text-primary-black-60">{label}</p>
      </div>
      {habits.map((h) => (
        <HabitRow key={h._id} habit={h} />
      ))}
    </div>
  );
}
