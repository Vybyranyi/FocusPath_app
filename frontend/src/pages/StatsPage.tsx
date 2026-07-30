import HabitGroup from "@components/stats/HabitGroup";
import StatsSummary from "@components/stats/StatsSummary";
import { getAllHabits } from "@store/habitSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import {
  selectAllHabits,
  selectBuildHabits,
  selectQuitHabits,
} from "@store/selectors";
import { useEffect } from "react";

export default function StatsPage() {
  const dispatch = useAppDispatch();
  // The store holds the API's Habit, so this page reads it directly. It used to
  // reach the shape it needed through a double cast, which switched off type
  // checking for everything below it.
  const habits = useAppSelector(selectAllHabits);
  const buildHabits = useAppSelector(selectBuildHabits);
  const quitHabits = useAppSelector(selectQuitHabits);
  const loading = useAppSelector((state) => state.habit.loading);

  useEffect(() => {
    dispatch(getAllHabits());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-base-bg pb-28 md:pb-12">
      <div className="container max-w-120 mx-auto pt-6 md:pt-10 flex flex-col gap-6">
        {loading && habits.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="body-bold text-primary-black-40">Loading...</p>
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <p className="body-bold">No habits yet</p>
            <p className="alternative text-primary-black-40">
              Create your first habit to see stats here!
            </p>
          </div>
        ) : (
          <>
            <StatsSummary habits={habits} />
            <HabitGroup habits={buildHabits} type="build" />
            <HabitGroup habits={quitHabits} type="quit" />
          </>
        )}
      </div>
    </div>
  );
}
