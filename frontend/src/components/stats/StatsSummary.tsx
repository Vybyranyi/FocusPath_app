import StatCard from "./StatCard";
import type { FullHabit } from "./FullHabit";

interface StatsSummaryProps {
  habits: FullHabit[];
}

export default function StatsSummary({ habits }: StatsSummaryProps) {
  const activeCount = habits.filter((h) => !h.isCompleted).length;
  const completedCount = habits.filter((h) => h.isCompleted).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  const totalDays = habits.reduce((sum, h) => sum + h.dailyCompletions.length, 0);
  const doneDays = habits.reduce(
    (sum, h) => sum + h.dailyCompletions.filter((d) => d.completed).length,
    0,
  );
  const overallRate = totalDays > 0 ? Math.round((doneDays / totalDays) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard value={activeCount} label="Active" />
      <StatCard value={completedCount} label="Completed" />
      <StatCard value={`${overallRate}%`} label="Done rate" accent />
      <StatCard value={`${bestStreak} 🔥`} label="Best streak" />
    </div>
  );
}
