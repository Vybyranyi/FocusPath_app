import { useState, useMemo } from "react";
import DatePicker from "@components/DatePicker/DatePicker";
import { cn } from "@/lib/utils";

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
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
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

  const weekStart = getWeekStart(startDate ?? new Date());
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const monthDates = useMemo(() => getMonthDates(weekStart), [weekStart]);

  const selectedStr = selectedDate
    ? new Date(selectedDate).toDateString()
    : null;

  const monthWeeks: Date[][] = [];
  for (let i = 0; i < monthDates.length; i += 7) {
    monthWeeks.push(monthDates.slice(i, i + 7));
  }

  const currentMonth = weekStart.toLocaleString("default", { month: "long" });

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
        <div className={datesRowClass}>
          {weekDates.map((date, i) => (
            <DatePicker
              key={i}
              date={date}
              active={selectedStr === date.toDateString()}
              error={!!error}
              onClick={() => onDateSelect(date)}
            />
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="flex flex-col gap-2">
          <p className="body-bold text-center mb-2">{currentMonth}</p>
          {monthWeeks.map((week, wi) => (
            <div key={wi} className={datesRowClass}>
              {week.map((date, di) => (
                <DatePicker
                  key={di}
                  date={date}
                  active={selectedStr === date.toDateString()}
                  error={!!error}
                  onClick={() => onDateSelect(date)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="alternative text-center mt-4 cursor-pointer text-primary-black-60 hover:text-primary-blue transition-colors"
      >
        {isExpanded ? "Show less" : "Show more"}
      </button>

      {error && <p className="alternative text-error mt-1">{error}</p>}
    </div>
  );
}
