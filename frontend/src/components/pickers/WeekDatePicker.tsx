import { cn } from "@/lib/utils";
import arrow_left from "@assets/images/icons/arrow-left.svg";
import arrow_right from "@assets/images/icons/arrow-right.svg";
import DatePicker from "@components/pickers/DatePicker";
import { useMemo, useState } from "react";

export interface IWeekDatePickerProps {
  label: string;
  selectedDate?: Date | string | number;
  onDateSelect: (date: Date) => void;
  startDate?: Date;
  error?: string;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Monday as first day
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function getMonthDates(base: Date): Date[] {
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const startOfCal = getWeekStart(first);
  const endOfCal = new Date(last);
  if (endOfCal.getDay() !== 0) {
    endOfCal.setDate(endOfCal.getDate() + (7 - endOfCal.getDay()));
  }

  const dates: Date[] = [];
  const cur = new Date(startOfCal);
  while (cur <= endOfCal) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

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

  const monthWeeks: Date[][] = [];
  for (let i = 0; i < monthDates.length; i += 7) {
    monthWeeks.push(monthDates.slice(i, i + 7));
  }

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

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const handleDateSelectInternal = (date: Date) => {
    onDateSelect(date);
    // When a date is selected, make sure both views follow it
    setCurrentWeekStart(getWeekStart(date));
    setViewDate(new Date(date));
  };

  const datesRowClass = cn(
    "flex gap-2 w-full items-center",
    "*:flex-1 *:min-w-0",
    "max-sm:gap-1",
    "md:justify-between",
  );

  return (
    <div className="flex flex-col w-full min-w-0">
      <p className="chip mb-1">{label}</p>

      {!isExpanded && (
        <div className="flex items-center gap-2">
          <button type="button" onClick={handlePrevWeek} className="p-1">
            <img src={arrow_left} alt="Previous week" className="w-5 h-5" />
          </button>
          <div className={datesRowClass}>
            {weekDates.map((date, i) => (
              <DatePicker
                key={i}
                date={date}
                active={selectedStr === date.toDateString()}
                error={!!error}
                onClick={() => handleDateSelectInternal(date)}
              />
            ))}
          </div>
          <button type="button" onClick={handleNextWeek} className="p-1">
            <img src={arrow_right} alt="Next week" className="w-5 h-5" />
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-4 mb-2">
            <button type="button" onClick={handlePrevMonth} className="p-1">
              <img src={arrow_left} alt="Previous month" className="w-5 h-5" />
            </button>
            <p className="body-bold min-w-[120px] text-center">
              {currentMonth}
            </p>
            <button type="button" onClick={handleNextMonth} className="p-1">
              <img src={arrow_right} alt="Next month" className="w-5 h-5" />
            </button>
          </div>

          {monthWeeks.map((week, wi) => (
            <div key={wi} className={datesRowClass}>
              {week.map((date, di) => (
                <DatePicker
                  key={di}
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
        className="alternative text-center mt-4 cursor-pointer text-primary-black-60 hover:text-primary-blue transition-colors"
      >
        {isExpanded ? "Show less" : "Show more"}
      </button>

      {error && <p className="alternative text-error mt-1">{error}</p>}
    </div>
  );
}
