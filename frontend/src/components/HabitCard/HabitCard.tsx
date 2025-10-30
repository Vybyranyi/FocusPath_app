import CircleLoader from '@components/CircleLoader/CircleLoader';
import styles from '@components/HabitCard/HabitCard.module.scss';
import IconButton from '@components/IconButton/IconButton';
import tick_success from '@assets/images/icons/tick_success.svg';
import eye_blue from '@assets/images/icons/eye_blue.svg';
import cross_red from '@assets/images/icons/cross_red.svg';
import arrow_right from '@assets/images/icons/arrow-right.svg';
import { useSwipeable } from 'react-swipeable';
import { useState } from 'react';
import type { habitForDate } from '@store/habitSlice';

interface IHabitCardProps {
    habit: habitForDate;
}

export default function HabitCard({ habit }: IHabitCardProps) {
    const [offset, setOffset] = useState(0);

    const handlers = useSwipeable({
        onSwiping: (e) => {
            // рухаємо картку тільки по горизонталі
            setOffset(Math.min(Math.max(e.deltaX, -129), 129)); // обмежуємо зсув
        },
        onSwiped: () => {
            // якщо свайпнули достатньо сильно → фіксуємо, інакше повертаємо назад
            if (offset > 80) setOffset(129); // вправо
            else if (offset < -80) setOffset(-129); // вліво
            else setOffset(0); // назад
        },
        trackMouse: true, // працює і з мишкою
    });

    // Обчислюємо прогрес (якщо потрібно для CircleLoader)
    const progress = habit.isCompleted ? 100 : Math.floor((habit.currentStreak / 21) * 100);

    return (
        <div className={styles.swipeWrapper}>
            <div className={`${styles.swipeContent} ${styles.left}`}>
                <button className={styles.habitAction}>
                    <img src={eye_blue} alt="View" />
                    <p className={`alternative ${styles.actionText}`}>View</p>
                </button>
                <span className={styles.separator}></span>
                <button className={styles.habitAction}>
                    <img src={tick_success} alt="Done" />
                    <p className={`alternative ${styles.actionText}`}>Done</p>
                </button>
            </div>

            <div className={`${styles.swipeContent} ${styles.right}`}>
                <button className={styles.habitAction}>
                    <img src={cross_red} alt="Fail" />
                    <p className={`alternative ${styles.actionText}`}>Fail</p>
                </button>
                <span className={styles.separator}></span>
                <button className={styles.habitAction}>
                    <img src={arrow_right} alt="Skip" />
                    <p className={`alternative ${styles.actionText}`}>Skip</p>
                </button>
            </div>

            <div
                {...handlers}
                className={styles.habitCard}
                style={{ 
                    transform: `translateX(${offset}px)`, 
                    transition: "transform 0.2s ease" 
                }}
            >
                <div className={styles.habitCardContent}>
                    <CircleLoader 
                        percentages={progress} 
                        emoji={habit.icon}
                        isWhite 
                    />
                    <div className={styles.habitCardText}>
                        <p className='body-bold'>{habit.title}</p>
                        <p className={`alternative ${styles.subText}`}>
                            {habit.dayInfo.dayTitle || 'Day ' + habit.currentStreak}
                        </p>
                    </div>
                </div>
                <IconButton 
                    size='small' 
                    icon={tick_success}
                />
            </div>
        </div>
    );
}