import FieldError from "@components/ui/FieldError";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";
import arrow_left from "@assets/images/icons/arrow-left.svg";
import arrow_right from "@assets/images/icons/arrow-right.svg";
import DatePicker from "@components/pickers/DatePicker";
import IconButton from "@components/ui/IconButton";
import { useCallback, useMemo, useState } from "react";

export interface IWeekDatePickerProps {
  label: string;
  selectedDate?: Date | string | number;
  onDateSelect: (date: Date) => void;
  startDate?: Date;
  error?: string;
}

// date-fns is already a dependency and WeekSelector was already using it for
// exactly this. The hand-rolled versions carried their own Sunday special case
// and their own month-boundary loop, both of which are easy to get subtly wrong.
const WEEK_STARTS_MONDAY = { weekStartsOn: 1 } as const;

const getWeekStart = (date: Date): Date => startOfWeek(date, WEEK_STARTS_MONDAY);

const getWeekDates = (start: Date): Date[] =>
  eachDayOfInterval({ start, end: addDays(start, 6) });

/** Whole weeks covering the month, so the grid always has complete rows. */
const getMonthDates = (base: Date): Date[] =>
  eachDayOfInterval({
    start: startOfWeek(startOfMonth(base), WEEK_STARTS_MONDAY),
    end: endOfWeek(endOfMonth(base), WEEK_STARTS_MONDAY),
  });

export default function WeekDatePicker({
  label,
  selectedDate,
  onDateSelect,
  startDate,
  error,
}: IWeekDatePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // viewDate tracks which month is shown in the expanded grid
  const [viewDate, setViewDate] = useState(new Date(startDate ?? new Date()));
  // currentWeekStart tracks which week is shown in the collapsed row
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getWeekStart(new Date(startDate ?? new Date())),
  );

  const weekDates = useMemo(
    () => getWeekDates(currentWeekStart),
    [currentWeekStart],
  );
  const monthDates = useMemo(() => getMonthDates(viewDate), [viewDate]);

  const selectedStr = selectedDate
    ? new Date(selectedDate).toDateString()
    : null;

  // Memoised alongside monthDates: rebuilding this on every render handed all
  // forty-two children new props and undid the memo above it.
  const monthWeeks = useMemo(() => {
    const weeks: Date[][] = [];
    for (let i = 0; i < monthDates.length; i += 7) {
      weeks.push(monthDates.slice(i, i + 7));
    }
    return weeks;
  }, [monthDates]);

  const currentMonth = viewDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() - 1);
    setViewDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    setViewDate(d);
  };

  const handlePrevWeek = () => setCurrentWeekStart((week) => addDays(week, -7));
  const handleNextWeek = () => setCurrentWeekStart((week) => addDays(week, 7));

  const handleDateSelectInternal = useCallback((date: Date) => {
    onDateSelect(date);
    // When a date is selected, make sure both views follow it
    setCurrentWeekStart(getWeekStart(date));
    setViewDate(new Date(date));
  }, [onDateSelect]);

  const datesRowClass = cn(
    "flex gap-2 w-full items-center",
    "*:flex-1 *:min-w-0",
    "max-sm:gap-1",
    "md:justify-between",
  );

  return (
    <div className="flex flex-col w-full min-w-0">
      <p className="field-label mb-1.5">{label}</p>

      {!isExpanded && (
        <div className="flex items-center gap-2">
          <IconButton size="small" label="Previous week" icon={arrow_left} onClick={handlePrevWeek} />
          <div className={datesRowClass}>
            {weekDates.map((date) => (
              <DatePicker
                key={date.toISOString()}
                date={date}
                active={selectedStr === date.toDateString()}
                error={!!error}
                onClick={() => handleDateSelectInternal(date)}
              />
            ))}
          </div>
          <IconButton size="small" label="Next week" icon={arrow_right} onClick={handleNextWeek} />
        </div>
      )}

      {isExpanded && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-4 mb-2">
            <IconButton size="small" label="Previous month" icon={arrow_left} onClick={handlePrevMonth} />
            <p className="body-bold min-w-[120px] text-center">
              {currentMonth}
            </p>
            <IconButton size="small" label="Next month" icon={arrow_right} onClick={handleNextMonth} />
          </div>

          {monthWeeks.map((week) => (
            <div key={week[0].toISOString()} className={datesRowClass}>
              {week.map((date) => (
                <DatePicker
                  key={date.toISOString()}
                  date={date}
                  active={selectedStr === date.toDateString()}
                  error={!!error}
                  disabled={date.getMonth() !== viewDate.getMonth()}
                  onClick={() => handleDateSelectInternal(date)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setIsExpanded((v) => !v);
          if (!isExpanded) {
            // Sync month view to either the selected date or current week when opening
            setViewDate(new Date(selectedDate ?? currentWeekStart));
          }
        }}
        className="alternative text-center mt-4 cursor-pointer text-ink-2 hover:text-accent transition-colors"
      >
        {isExpanded ? "Show less" : "Show more"}
      </button>

      <FieldError message={error} />
    </div>
  );
}
