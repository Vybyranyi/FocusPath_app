import styles from '@components/WeekSelector/WeekSelector.module.scss';
import { useState } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, differenceInCalendarWeeks } from "date-fns";
import IconButton from '@components/IconButton/IconButton';
import arrow_left from '@assets/images/icons/arrow-left.svg';
import arrow_right from '@assets/images/icons/arrow-right.svg';

export default function WeekSelector() {
    const today = new Date();
    const [currentWeek, setCurrentWeek] = useState(today);

    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const formattedRange = `${format(start, "MMM d")} - ${format(end, "MMM d")}`;

    const goPrevWeek = () => setCurrentWeek(addWeeks(currentWeek, -1));
    const goNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

    const diff = differenceInCalendarWeeks(currentWeek, today, { weekStartsOn: 1 });

    let label = "This week";
    if (diff === -1) label = "Previous week";
    if (diff < -1) label = `${Math.abs(diff)} weeks ago`;
    if (diff === 1) label = "Next week";
    if (diff > 1) label = `In ${diff} weeks`;

    return (
        <div className={styles.weekSelector}>
            <div className={styles.content}>
                <p className='body-bold'>{label}</p>
                <p className={`alternative ${styles.showedWeek}`}>{formattedRange}</p>
            </div>
            <div className={styles.buttons}>
                <IconButton
                    size='medium'
                    icon={arrow_left}
                    onClick={goPrevWeek}
                />
                <IconButton
                    size='medium'
                    icon={arrow_right}
                    onClick={goNextWeek}
                />
            </div>
        </div>
    );
}