import { useState, useMemo } from 'react';
import DatePicker from '@components/DatePicker/DatePicker';
import styles from '@components/WeekDatePicker/WeekDatePicker.module.scss';

export interface IWeekDatePickerProps {
    label: string;
    selectedDate?: Date | string | number;
    onDateSelect: (date: Date) => void;
    startDate?: Date;
    error?: string;
}

export default function WeekDatePicker(props: IWeekDatePickerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const getWeekStart = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const getWeekDates = (startDate: Date) => {
        const dates = [];
        const start = new Date(startDate);
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date);
        }
        
        return dates;
    };

    const getMonthDates = (startDate: Date) => {
        const dates = [];
        const start = new Date(startDate);
        const year = start.getFullYear();
        const month = start.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        const startOfCalendar = getWeekStart(firstDayOfMonth);
        
        const endOfCalendar = new Date(lastDayOfMonth);
        const endDay = endOfCalendar.getDay();
        if (endDay !== 0) {
            endOfCalendar.setDate(endOfCalendar.getDate() + (7 - endDay));
        }
        
        const current = new Date(startOfCalendar);
        while (current <= endOfCalendar) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return dates;
    };

    const baseDate = props.startDate || new Date();
    const weekStart = getWeekStart(baseDate);
    
    const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
    const monthDates = useMemo(() => getMonthDates(weekStart), [weekStart]);
    
    const selectedDateStr = props.selectedDate && props.selectedDate !== null 
        ? new Date(props.selectedDate).toDateString() 
        : null;

    const handleDateClick = (date: Date) => {
        props.onDateSelect(date);
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const monthWeeks = [];
    for (let i = 0; i < monthDates.length; i += 7) {
        monthWeeks.push(monthDates.slice(i, i + 7));
    }

    const currentMonth = weekStart.toLocaleString('default', { month: 'long'});

    return (
        <div className={styles.weekDatePicker}>
            <p className={`chip ${styles.label}`}>{props.label}</p>
            
            {!isExpanded && (
                <div className={styles.weekContainer}>
                    <div className={styles.datesRow}>
                        {weekDates.map((date, index) => (
                            <DatePicker
                                key={index}
                                date={date}
                                active={selectedDateStr === date.toDateString()}
                                onClick={() => handleDateClick(date)}
                                error={props.error ? true : false}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isExpanded && (
                <div className={styles.monthContainer}>
                    <p className={`body-bold ${styles.monthTitle}`}>{currentMonth}</p>
                    <div className={styles.monthGrid}>
                        {monthWeeks.map((week, weekIndex) => (
                            <div key={weekIndex} className={styles.weekRow}>
                                {week.map((date, dateIndex) => (
                                    <DatePicker
                                        key={dateIndex}
                                        date={date}
                                        active={selectedDateStr === date.toDateString()}
                                        onClick={() => handleDateClick(date)}
                                        error={props.error ? true : false}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button 
                type="button"
                className={`alternative ${styles.toggleButton}`}
                onClick={toggleExpanded}
            >
                {isExpanded ? 'Show less' : 'Show more'}
            </button>
            {props.error && (
                <div className={styles.errorPopup}>
                    <span className="alternative">{props.error}</span>
                </div>
            )}
        </div>
    );
}