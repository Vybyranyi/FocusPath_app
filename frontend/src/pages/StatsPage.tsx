import HabitGroup from "@components/stats/HabitGroup";
import StatsSummary from "@components/stats/StatsSummary";
import type { FullHabit } from "@components/stats/FullHabit";
import IconButton from "@components/ui/IconButton";
import arrow_left from "@assets/images/icons/arrow-left.svg";
import { getAllHabits } from "@store/habitSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function StatsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { habits, loading } = useAppSelector((s) => s.habit);
  const fullHabits = habits as unknown as FullHabit[];

  useEffect(() => {
    dispatch(getAllHabits());
  }, [dispatch]);

  const buildHabits = fullHabits.filter((h) => h.type === "build");
  const quitHabits = fullHabits.filter((h) => h.type === "quit");

  return (
    <div className="min-h-screen bg-base-bg pb-28 md:pb-12">

      <div className="container max-w-120 mx-auto pt-6 md:pt-10 flex flex-col gap-6">

        {loading && fullHabits.length === 0 ? (
          <div className="flex justify-center py-16">
            <p className="body-bold text-primary-black-40">Loading...</p>
          </div>
        ) : fullHabits.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <p className="body-bold">No habits yet</p>
            <p className="alternative text-primary-black-40">
              Create your first habit to see stats here!
            </p>
          </div>
        ) : (
          <>
            <StatsSummary habits={fullHabits} />
            <HabitGroup habits={buildHabits} type="build" />
            <HabitGroup habits={quitHabits} type="quit" />
          </>
        )}
      </div>
    </div>
  );
}
