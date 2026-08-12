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
import { useNavigate } from "react-router";
import Button from "@components/ui/Button";

export default function StatsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-canvas pb-28 md:pb-12">
      <div className="page-gutter max-w-120 mx-auto pt-6 md:pt-10 flex flex-col gap-6">
        {loading && habits.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="body-bold text-ink-muted">Loading...</p>
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <p className="body-bold">No habits yet</p>
            <p className="alternative text-ink-muted max-w-64">
              Stats appear once you have a habit to track.
            </p>
            <div className="w-full max-w-56 pt-1">
              <Button type="primary" size="medium" onClick={() => navigate("/createhabit")}>
                Create a habit
              </Button>
            </div>
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
