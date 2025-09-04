import styles from '@components/CircleLoader/CircleLoader.module.scss';
import tick from '@assets/images/icons/tick.svg';
import { Emoji } from 'react-apple-emojis';

export interface ICircleLoader {
    percentages: number;
    emoji?: string;
    isWhite?: boolean;
}

export default function CircleLoader(props: ICircleLoader) {
    const size = 36;
    const strokeWidth = 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (props.percentages / 100) * circumference;

    return (
        <span className={`${styles.circleLoaderWrapper} ${props.isWhite ? styles.isWhite : ''}`}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ transform: 'rotate(-90deg)' }}
            >
                <circle
                    className={styles.bg}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                />
                <circle
                    className={styles.progressCircle}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <span className={styles.label}>
                {props.emoji ? (
                    <Emoji className={styles.emoji} name={props.emoji} />
                ) : (
                    props.percentages === 100 ? (
                        <img src={tick} alt='tick' className={styles.tickIcon} />
                    ) : (
                        <span className={`alternative ${styles.percents}`}>
                            {`%${props.percentages}`}
                        </span>
                    )
                )}
            </span>
        </span>
    );
}