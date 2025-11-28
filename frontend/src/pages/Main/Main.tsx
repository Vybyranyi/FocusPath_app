import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { getHabitsForDate } from "@store/habitSlice";
import { nextWeek, prevWeek } from "@store/calendarSlice";
import { useSwipeable } from "react-swipeable";
import HabitCard from "@components/HabitCard/HabitCard";
import styles from "./Main.module.scss";
import DatePicker from "@components/DatePicker/DatePicker";

export default function Main() {
    const dispatch = useAppDispatch();
    const { habitsForDate, loading, error } = useAppSelector(state => state.habit);
    const { currentWeekStart } = useAppSelector(state => state.calendar);
    const [dates, setDates] = useState<Date[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date()); // Keep selectedDate for fetching habits

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => dispatch(nextWeek()),
        onSwipedRight: () => dispatch(prevWeek()),
        trackMouse: true
    });

    useEffect(() => {
        dispatch(getHabitsForDate(selectedDate.toISOString()));
    }, [dispatch, selectedDate]);

    useEffect(() => {
        const start = new Date(currentWeekStart);
        const tempDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            tempDates.push(date);
        }
        setDates(tempDates);
    }, [currentWeekStart]);

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className={styles.emptyState}>
                    <p className="body-bold">Loading habits...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.emptyState}>
                    <p className={`body-bold ${styles.errorMessage}`}>
                        Error: {error}
                    </p>
                </div>
            );
        }

        if (habitsForDate.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <p className="body-bold">No habits for this day</p>
                    <p className="alternative">Create your first habit to get started!</p>
                </div>
            );
        }

        return (
            <div className={styles.habitsContainer}>
                {habitsForDate.map((habit) => (
                    <HabitCard
                        key={habit._id}
                        habit={habit}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className={`container ${styles.mainPage}`}>
            <div className={styles.habitsContainer}>
                <div className={styles.dateSelector} {...swipeHandlers}>
                    {dates.map((date, index) => (
                        <DatePicker
                            key={index}
                            date={date}
                            active={isSameDay(date, selectedDate)}
                            onClick={() => setSelectedDate(date)}
                        />
                    ))}
                </div>
                {renderContent()}
            </div>
        </div>
    );
}