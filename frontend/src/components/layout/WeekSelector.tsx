import { format, startOfWeek, endOfWeek, differenceInCalendarWeeks } from 'date-fns';
import IconButton from '@components/ui/IconButton';
import arrow_left  from '@assets/images/icons/arrow-left.svg';
import arrow_right from '@assets/images/icons/arrow-right.svg';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { nextWeek, prevWeek } from '@store/calendarSlice';

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
    <div className="flex items-center justify-between">
      <div>
        <p className="body-bold">{label}</p>
        <p className="alternative text-ink-2">{formattedRange}</p>
      </div>
      <div className="flex gap-2">
        <IconButton size="medium" label="Previous week" icon={arrow_left}  onClick={() => dispatch(prevWeek())} />
        <IconButton size="medium" label="Next week" icon={arrow_right} onClick={() => dispatch(nextWeek())} />
      </div>
    </div>
  );
}
