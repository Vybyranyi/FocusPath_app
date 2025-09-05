import CircleLoader from '@components/CircleLoader/CircleLoader';
import styles from '@components/HabitCard/HabitCard.module.scss';
import IconButton from '@components/IconButton/IconButton';
import tick_success from '@assets/images/icons/tick_success.svg';

export default function HabitCard() {
    return (
        <div className={styles.habitCard}>
            <div className={styles.habitCardContent}>
                <CircleLoader percentages={37} emoji='droplet' isWhite />
                <div className={styles.habitCardText}>
                    <p className='body-bold'>
                        Drink the water
                    </p>
                    <p className={`alternative ${styles.subText}`}>
                        500/2000 ML
                    </p>
                </div>

            </div>
            <IconButton size='small' icon={tick_success} />
        </div>
    )
};