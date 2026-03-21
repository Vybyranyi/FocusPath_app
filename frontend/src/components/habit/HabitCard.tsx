import CircleLoader from '@components/habit/CircleLoader';
import IconButton   from '@components/ui/IconButton';
import tick_success from '@assets/images/icons/tick_success.svg';
import eye_blue     from '@assets/images/icons/eye_blue.svg';
import cross_red    from '@assets/images/icons/cross_red.svg';
import arrow_right  from '@assets/images/icons/arrow-right.svg';
import { useSwipeable } from 'react-swipeable';
import { useState } from 'react';
import type { habitForDate } from '@store/habitSlice';
import { motion } from 'framer-motion';

interface IHabitCardProps {
  habit: habitForDate;
}

const actionPanelBase = [
  'absolute top-0 bottom-0 z-10 flex gap-3 items-center px-4',
  'bg-base-white ring-card rounded-2xl w-max',
].join(' ');

export default function HabitCard({ habit }: IHabitCardProps) {
  const [offset, setOffset] = useState(0);
  const progress = habit.isCompleted ? 100 : Math.floor((habit.currentStreak / 21) * 100);

  const handlers = useSwipeable({
    onSwiping: e => setOffset(Math.min(Math.max(e.deltaX, -129), 129)),
    onSwiped:  () => {
      if (offset > 80)       setOffset(129);
      else if (offset < -80) setOffset(-129);
      else                   setOffset(0);
    },
    trackMouse: true,
  });

  return (
    <div className="relative overflow-hidden">
      {/* Left action panel */}
      <div className={`${actionPanelBase} left-0`}>
        <ActionButton icon={eye_blue}    label="View" />
        <Separator />
        <ActionButton icon={tick_success} label="Done" />
      </div>

      {/* Right action panel */}
      <div className={`${actionPanelBase} right-0`}>
        <ActionButton icon={cross_red}  label="Fail" />
        <Separator />
        <ActionButton icon={arrow_right} label="Skip" />
      </div>

      {/* Swipeable card */}
      <motion.div
        {...handlers}
        animate={{ x: offset }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-20 flex items-center justify-between p-4 bg-base-white ring-card rounded-2xl"
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
        <IconButton size="small" icon={tick_success} />
      </motion.div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="flex flex-col items-center w-8">
      <img src={icon} alt={label} className="w-5 h-5" />
      <p className="alternative text-primary-black-40">{label}</p>
    </button>
  );
}

function Separator() {
  return <span className="w-px h-8 bg-primary-black-10 block" />;
}
