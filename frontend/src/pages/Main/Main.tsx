import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [direction, setDirection] = useState(0);
    const prevWeekStart = useRef(currentWeekStart);

    // Derive calendar direction
    let calendarDirection = 0;
    if (currentWeekStart > prevWeekStart.current) {
        calendarDirection = 1;
    } else if (currentWeekStart < prevWeekStart.current) {
        calendarDirection = -1;
    }

    // Update ref after render
    useEffect(() => {
        prevWeekStart.current = currentWeekStart;
    }, [currentWeekStart]);

    // Derive dates
    const dates = useMemo(() => {
        const start = new Date(currentWeekStart);
        const tempDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            tempDates.push(date);
        }
        return tempDates;
    }, [currentWeekStart]);

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => {
            dispatch(nextWeek());
        },
        onSwipedRight: () => {
            dispatch(prevWeek());
        },
        trackMouse: true
    });

    const variants: Variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    const handleDateClick = (date: Date) => {
        setDirection(date > selectedDate ? 1 : -1);
        setSelectedDate(date);
    };

    useEffect(() => {
        dispatch(getHabitsForDate(selectedDate.toISOString()));
    }, [dispatch, selectedDate]);



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
            <motion.div
                key={selectedDate.toISOString()}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                }}
                className={styles.habitsContainer}
            >
                {habitsForDate.map((habit) => (
                    <HabitCard
                        key={habit._id}
                        habit={habit}
                    />
                ))}
            </motion.div>
        );
    };

    return (
        <div className={`container ${styles.mainPage}`}>
            <div className={styles.habitsContainer}>
                <div className={styles.dateSelectorWrapper} {...swipeHandlers}>
                    <AnimatePresence mode="wait" custom={calendarDirection}>
                        <motion.div
                            key={currentWeekStart}
                            custom={calendarDirection}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className={styles.dateSelector}
                        >
                            {dates.map((date, index) => (
                                <DatePicker
                                    key={index}
                                    date={date}
                                    active={isSameDay(date, selectedDate)}
                                    onClick={() => handleDateClick(date)}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <AnimatePresence mode="wait" custom={direction}>
                    {renderContent()}
                </AnimatePresence>
            </div>
        </div>
    );
}