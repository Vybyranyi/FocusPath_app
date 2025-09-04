import CircleLoader from '@components/CircleLoader/CircleLoader';
import styles from '@components/ProgressBanner/ProgressBanner.module.scss';
import { Emoji } from 'react-apple-emojis';

export default function ProgressBanner() {
    return (
        <div className={styles.progressBanner}>
            <CircleLoader percentages={56} isWhite />
            <div className={styles.progresText}>
                <p className={`body-bold ${styles.mainText}`}>
                    Your daily goals almost done!
                    <Emoji className={styles.emoji} name='fire' />
                </p>
                <p className={`alternative ${styles.secondaryText}`}>
                    1 of 4 completed
                </p>
            </div>
        </div>
    )
}