import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Emoji } from 'react-apple-emojis';
import cross_red from '@assets/images/icons/cross_red.svg';
import tick_success from '@assets/images/icons/tick_success.svg';
import { useAppDispatch } from '@store/hooks';
import { toggleHabitStep, deleteHabit } from '@store/habitSlice';
import { getHabitProgress } from '@/lib/habitProgress';
import { dayKeyOf, fromDayKey } from '@/lib/dates';
import { isDone } from '@/lib/habitStatus';
import type { HabitSummary } from '@shared/index';
import { format, addDays } from 'date-fns';

interface IHabitDetailPopupProps {
  habit: HabitSummary;
  onClose: () => void;
}

const DotsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="17" r="1.5" />
  </svg>
);

export default function HabitDetailPopup({ habit, onClose }: IHabitDetailPopupProps) {
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Steps, when a habit has them, are a finer measure of the same thing.
  const steps = habit.steps ?? [];
  const progress = steps.length > 0
    ? getHabitProgress(steps.filter(step => step.completed).length, steps.length)
    : getHabitProgress(habit.completedCount, habit.duration);

  const handleToggleStep = (stepId: string) => {
    dispatch(toggleHabitStep({ habitId: habit._id, stepId }));
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      dispatch(deleteHabit(habit._id));
      onClose();
    }
  };

  const calculateDeadline = () => {
    if (!habit.startDate || !habit.duration) return null;
    try {
        // Through the day key, so the deadline is counted from the day the
        // schedule actually names rather than from whatever local day midnight
        // UTC happens to fall on here.
        const start = fromDayKey(dayKeyOf(habit.startDate));
        return format(addDays(start, habit.duration - 1), 'MMM do, yyyy');
    } catch {
        return null;
    }
  };

  const deadline = calculateDeadline();

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center bg-ink/60 backdrop-blur-sm px-0 pb-0 lg:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full lg:max-w-md max-h-[90vh] overflow-y-auto bg-surface rounded-t-3xl lg:rounded-3xl p-6 flex flex-col gap-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Area */}
        <div className="flex items-start justify-between gap-3 relative">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-canvas flex items-center justify-center shadow-inner">
               <Emoji name={habit.icon || "dart"} className="w-8 h-8" />
            </div>
            <div className="min-w-0 flex flex-col pt-1 gap-1.5">
              <p className="title text-2xl truncate text-ink leading-none">{habit.title}</p>
              <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full leading-none ${
                      habit.type === 'build'
                        ? 'bg-accent-soft text-accent'
                        : 'bg-danger-soft text-danger'
                    }`}
                  >
                    {habit.category || (habit.type === 'build' ? 'BUILD' : 'QUIT')}
                  </span>
                  {deadline && (
                     <span className="text-[10px] font-semibold text-ink-2 bg-canvas px-2 py-1 rounded-full flex items-center gap-1 leading-none border border-line">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {deadline}
                     </span>
                  )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative" ref={menuRef}>
               <button
                 onClick={() => setMenuOpen(!menuOpen)}
                 className="w-10 h-10 flex items-center justify-center rounded-full bg-canvas text-ink-2 hover:bg-line hover:text-ink transition-colors"
               >
                 <DotsIcon />
               </button>
               <AnimatePresence>
                 {menuOpen && (
                   <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: -10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -10 }}
                     transition={{ duration: 0.15 }}
                     className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-line overflow-hidden z-10"
                   >
                     <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-sm font-medium text-danger hover:bg-danger-soft transition-colors flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        Delete Goal
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-canvas hover:bg-line transition-colors shrink-0"
            >
              <img src={cross_red} className="w-3.5 h-3.5 opacity-70" alt="Close" />
            </button>
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-end">
               <p className="text-sm font-semibold tracking-wide text-ink-2 uppercase">Overall Progress</p>
               <p className="text-3xl font-bold text-ink leading-none">{progress}%</p>
            </div>
            <div className="w-full h-4 bg-canvas rounded-full overflow-hidden shadow-inner">
                <motion.div 
                   className="h-full bg-accent rounded-full relative overflow-hidden"
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   transition={{ duration: 0.5, ease: "easeOut" }}
                >
                   <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-1/2" />
                </motion.div>
            </div>
        </div>

        {/* Description Section */}
        {habit.description && (
            <div className="bg-ink/5 rounded-2xl p-4 border border-line relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/30 rounded-l-2xl" />
               <p className="text-ink-2 text-sm leading-relaxed whitespace-pre-wrap">{habit.description}</p>
            </div>
        )}

        {/* Steps List */}
        {steps.length > 0 ? (
            <div className="flex flex-col gap-3">
               <p className="text-sm font-semibold tracking-wide text-ink-2 uppercase mb-1">Steps to Complete</p>
               <div className="flex flex-col gap-2">
               {habit.steps!.map((step) => (
                   <motion.div 
                      key={step._id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleToggleStep(step._id)}
                      className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all border ${
                          step.completed 
                             ? 'bg-success-soft border-success-soft shadow-sm' 
                             : 'bg-surface border-line hover:border-accent/30 hover:shadow-sm'
                      }`}
                   >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          step.completed ? 'bg-success text-on-accent' : 'border-2 border-ink-faint'
                      }`}>
                          <AnimatePresence mode="popLayout">
                          {step.completed && (
                              <motion.svg 
                                  key="check"
                                  initial={{ scale: 0, opacity: 0 }} 
                                  animate={{ scale: 1, opacity: 1 }} 
                                  exit={{ scale: 0, opacity: 0 }}
                                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                              >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                              </motion.svg>
                          )}
                          </AnimatePresence>
                      </div>
                      <p className={`text-[15px] font-medium transition-colors ${step.completed ? 'text-ink-muted line-through' : 'text-ink'}`}>
                          {step.title}
                      </p>
                   </motion.div>
               ))}
               </div>
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-3 mt-2">
               <div className="bg-canvas rounded-2xl p-5 flex flex-col justify-center items-center relative overflow-hidden group border border-line border-transparent hover:border-line transition-colors">
                   <p className="text-[11px] font-bold tracking-wider text-ink-muted uppercase mb-2">Current Streak</p>
                   <p className="text-4xl font-bold text-ink leading-none">{habit.currentStreak}</p>
                   <p className="text-[11px] font-medium text-ink-muted mt-1 uppercase tracking-widest">Days</p>
               </div>
               {/* Today's status */}
               <div
                   className={`rounded-2xl p-5 flex flex-col justify-center items-center relative overflow-hidden transition-colors border ${
                   isDone(habit.dayInfo) ? 'bg-success-soft text-success border-success-soft' : 'bg-canvas border-transparent hover:border-line'
                   }`}
               >
                   <p className={`text-[11px] font-bold tracking-wider uppercase mb-2 ${isDone(habit.dayInfo) ? 'text-success/70' : 'text-ink-muted'}`}>Today</p>
                   {isDone(habit.dayInfo) ? (
                       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                            <img src={tick_success} className="w-12 h-12 object-contain drop-shadow-sm" alt="Completed" />
                       </motion.div>
                   ) : (
                       <p className="text-xl font-bold text-ink-2 text-center leading-tight">
                          {habit.dayInfo.dayTitle || `Day ${habit.currentStreak}`}
                       </p>
                   )}
               </div>
            </div>
        )}

      </motion.div>
    </motion.div>,
    document.body,
  );
}
