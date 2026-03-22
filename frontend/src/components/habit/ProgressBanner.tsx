import CircleLoader from "@components/habit/CircleLoader";
import { Emoji } from "react-apple-emojis";
import { useAppSelector } from "@store/hooks";

export default function ProgressBanner() {
  const { habitsForDate } = useAppSelector(s => s.habit);

  const total     = habitsForDate.length;
  const completed = habitsForDate.filter(h => h.dayInfo.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <div className="bg-blue-gradient flex items-center gap-3 p-4 rounded-2xl">
      <CircleLoader percentages={percentage} isWhite />
      <div>
        <p className="body-bold text-base-white mb-1 flex items-center gap-1.5">
          {completed === total ? "All goals completed!" : "Your daily goals almost done!"}
          <Emoji name="fire" className="w-3 h-3" />
        </p>
        <p className="alternative text-primary-blue-40">{completed} of {total} completed</p>
      </div>
    </div>
  );
}
