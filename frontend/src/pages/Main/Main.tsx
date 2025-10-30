import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { getHabitsForDate } from "@store/habitSlice";
import HabitCard from "@components/HabitCard/HabitCard";
import styles from "./Main.module.scss";

export default function Main() {
    const dispatch = useAppDispatch();
    const { habitsForDate, loading, error } = useAppSelector(state => state.habit);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        dispatch(getHabitsForDate(selectedDate.toISOString()));
    }, [dispatch, selectedDate]);

    if (loading) {
        return (
            <div className={`container ${styles.mainPage}`}>
                <p className="body-bold">Loading habits...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`container ${styles.mainPage}`}>
                <p className="body-bold" style={{ color: 'var(--Primary-Red-error)' }}>
                    Error: {error}
                </p>
            </div>
        );
    }

    return (
        <div className={`container ${styles.mainPage}`}>
            <div className={styles.habitsContainer}>
                {habitsForDate.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p className="body-bold">No habits for this day</p>
                        <p className="alternative">Create your first habit to get started!</p>
                    </div>
                ) : (
                    habitsForDate.map((habit) => (
                        <HabitCard 
                            key={habit._id}
                            habit={habit}
                        />
                    ))
                )}
            </div>
        </div>
    );
}