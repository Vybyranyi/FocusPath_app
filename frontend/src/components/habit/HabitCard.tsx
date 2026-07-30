import CircleLoader from '@components/habit/CircleLoader';
import tick_success from '@assets/images/icons/tick_success.svg';
import cross_red    from '@assets/images/icons/cross_red.svg';
import { useSwipeable } from 'react-swipeable';
import { useState, useRef, useEffect } from 'react';
import type { HabitSummary } from '@shared/index';
import { markHabitCompletion } from '@store/habitSlice';
import { useAppDispatch } from '@store/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import HabitDetailPopup from '@components/habit/HabitDetailPopup';

interface IHabitCardProps {
  habit: HabitSummary;
}

type Status = 'idle' | 'done' | 'failed';

function getDateOnly(d: Date | string) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function HabitCard({ habit }: IHabitCardProps) {
  const dispatch   = useAppDispatch();
  const [showDetail, setShowDetail] = useState(false);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const wasSwipedRef = useRef(false);

  const today     = getDateOnly(new Date());
  const habitDate = getDateOnly(habit.dayInfo.date);
  const isFuture  = habitDate > today;
  const isPast    = habitDate < today;

  const getInitialStatus = (): Status => {
    if (habit.dayInfo.completed) return 'done';
    if (isPast) return 'failed';
    return 'idle';
  };

  const [status, setStatus] = useState<Status>(getInitialStatus);

  // Sync status when Redux updates the habit
  useEffect(() => {
    if (habit.dayInfo.completed) {
      setStatus('done');
    } else if (isPast) {
      setStatus('failed');
    }
    // For today + completed=false: preserve local 'failed' state set by user
  }, [habit.dayInfo.completed, habit.dayInfo.date, isPast]);

  // Circle: completed tasks out of total duration
  const progress = habit.duration > 0
    ? Math.min(100, Math.floor((habit.completedCount / habit.duration) * 100))
    : 0;

  const handleComplete = (completed: boolean) => {
    dispatch(markHabitCompletion({
      habitId: habit._id,
      date: habit.dayInfo.date,
      completed,
    }));
    setStatus(completed ? 'done' : 'failed');
  };

  const handlers = useSwipeable({
    onSwiping: e => {
      if (isFuture) return;
      setSwipeDelta(e.deltaX);
      if (Math.abs(e.deltaX) > 10) wasSwipedRef.current = true;
    },
    onSwiped: e => {
      if (!isFuture) {
        if (e.deltaX > 80)       handleComplete(true);
        else if (e.deltaX < -80) handleComplete(false);
      }
      setSwipeDelta(0);
      setTimeout(() => { wasSwipedRef.current = false; }, 300);
    },
    trackMouse: false,
  });

  const handleClick = () => {
    if (wasSwipedRef.current) return;
    setShowDetail(true);
  };

  const ringStyle: React.CSSProperties =
    status === 'done'   ? { boxShadow: 'inset 0 0 0 1.5px #3BA935' } :
    status === 'failed' ? { boxShadow: 'inset 0 0 0 1.5px #E3524F' } :
    { boxShadow: 'inset 0 0 0 1px #EAECF0' };

  const swipeBgClass =
    swipeDelta > 30  ? 'bg-success-20' :
    swipeDelta < -30 ? 'bg-error-20'   :
    '';

  return (
    <>
      <div className={`relative overflow-hidden rounded-2xl transition-colors duration-150 ${swipeBgClass}`}>
        <motion.div
          {...handlers}
          animate={{ x: isFuture ? 0 : Math.min(Math.max(swipeDelta * 0.2, -24), 24) }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={ringStyle}
          className={`relative z-20 flex items-center justify-between p-4 rounded-2xl cursor-pointer bg-base-white ${isFuture ? 'opacity-50' : ''}`}
          onClick={handleClick}
        >
          <div className="flex items-center gap-3">
            <CircleLoader percentages={progress} emoji={habit.icon} isWhite />
            <div>
              <p className="body-bold">{habit.title}</p>
              <p className="alternative text-primary-black-40">
                {habit.dayInfo.dayTitle || `Day ${habit.currentStreak}`}
              </p>
            </div>
          </div>

          {/* Desktop: Done / Fail buttons (hidden on mobile, hidden for future habits) */}
          {!isFuture && (
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-success-20 transition-colors"
                onClick={e => { e.stopPropagation(); handleComplete(true); }}
              >
                <img src={tick_success} className="w-4 h-4" alt="Done" />
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-error-20 transition-colors"
                onClick={e => { e.stopPropagation(); handleComplete(false); }}
              >
                <img src={cross_red} className="w-4 h-4" alt="Fail" />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showDetail && (
          <HabitDetailPopup habit={habit} onClose={() => setShowDetail(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
