import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Emoji } from 'react-apple-emojis';
import cross_red    from '@assets/images/icons/cross_red.svg';
import tick_success from '@assets/images/icons/tick_success.svg';
import type { habitForDate } from '@store/habitSlice';

interface IHabitDetailPopupProps {
  habit: habitForDate;
  onClose: () => void;
}

export default function HabitDetailPopup({ habit, onClose }: IHabitDetailPopupProps) {
  const progress = habit.duration > 0
    ? Math.min(100, Math.floor((habit.completedCount / habit.duration) * 100))
    : 0;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-200 flex items-end lg:items-center justify-center bg-primary-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full lg:max-w-md bg-base-white rounded-t-3xl lg:rounded-3xl p-6 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Emoji name={habit.icon} className="w-10 h-10 shrink-0" />
            <div className="min-w-0">
              <p className="title truncate">{habit.title}</p>
              <span
                className={`chip inline-block px-2 py-0.5 rounded-full mt-1 ${
                  habit.type === 'build'
                    ? 'bg-primary-blue-10 text-primary-blue'
                    : 'bg-error-20 text-error'
                }`}
              >
                {habit.type === 'build' ? 'BUILD' : 'QUIT'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-black-10 transition-colors shrink-0"
          >
            <img src={cross_red} className="w-4 h-4" alt="Close" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-base-bg rounded-2xl p-4">
            <p className="alternative text-primary-black-40 mb-1">Current Streak</p>
            <p className="title">{habit.currentStreak} days</p>
          </div>
          <div className="bg-base-bg rounded-2xl p-4">
            <p className="alternative text-primary-black-40 mb-1">Progress</p>
            <p className="title">{progress}%</p>
          </div>
        </div>

        {/* Today's status */}
        <div
          className={`rounded-2xl p-4 flex items-center justify-between ${
            habit.dayInfo.completed ? 'bg-success-20' : 'bg-primary-black-10'
          }`}
        >
          <div>
            <p className="alternative text-primary-black-40 mb-0.5">Today</p>
            <p className="body-bold">
              {habit.dayInfo.dayTitle || `Day ${habit.currentStreak}`}
            </p>
          </div>
          {habit.dayInfo.completed && (
            <img src={tick_success} className="w-5 h-5" alt="Completed" />
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
