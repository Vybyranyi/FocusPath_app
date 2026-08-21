import { format, startOfWeek, endOfWeek, differenceInCalendarWeeks } from 'date-fns';
import IconButton from '@components/ui/IconButton';
import arrow_left  from '@assets/images/icons/arrow-left.svg';
import arrow_right from '@assets/images/icons/arrow-right.svg';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { nextWeek, prevWeek, thisWeek } from '@store/calendarSlice';

export default function WeekSelector() {
  const dispatch = useAppDispatch();
  const { currentWeekStart } = useAppSelector(state => state.calendar);
  const currentWeek = new Date(currentWeekStart);

  const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const end   = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const formattedRange = `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;

  const diff = differenceInCalendarWeeks(currentWeek, new Date(), { weekStartsOn: 1 });
  let label = 'This week';
  if (diff === -1) label = 'Previous week';
  if (diff < -1)  label = `${Math.abs(diff)} weeks ago`;
  if (diff === 1) label = 'Next week';
  if (diff > 1)   label = `In ${diff} weeks`;

  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="body-bold">{label}</p>
        <p className="alternative text-ink-2">{formattedRange}</p>
      </div>
      <div className="flex items-center gap-2">
        {/* The way back. Stepping a week at a time is fine for one hop and
            tedious for five, and nothing else on this screen says where today
            is once you have wandered off it. Absent on the current week, where
            it would do nothing. */}
        {diff !== 0 && (
          <button
            type="button"
            onClick={() => dispatch(thisWeek())}
            className={[
              'min-h-11 px-3 rounded-full body-bold text-accent cursor-pointer whitespace-nowrap',
              'hover:bg-accent-soft transition-colors duration-(--duration-fast)',
            ].join(' ')}
          >
            This week
          </button>
        )}
        <IconButton size="medium" label="Previous week" icon={arrow_left}  onClick={() => dispatch(prevWeek())} />
        <IconButton size="medium" label="Next week" icon={arrow_right} onClick={() => dispatch(nextWeek())} />
      </div>
    </div>
  );
}
