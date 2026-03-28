export interface FullHabit {
  _id: string;
  title: string;
  type: "build" | "quit";
  color: string;
  icon: string;
  startDate: string;
  duration: number;
  currentStreak: number;
  isCompleted: boolean;
  dailyCompletions: Array<{
    _id: string;
    dayTitle: string;
    date: string;
    completed: boolean;
  }>;
}
