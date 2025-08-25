import styles from '@components/Box/Box.module.scss';
import { Emoji } from 'react-apple-emojis';

export interface IBoxProps {
    emoji: string;
    title: string;
    text: string;
    color: 'white' | 'orange' | 'blue' | 'lightblue' | 'red' | 'yellow' | 'green' | 'purple' | 'teal' | 'gradient';
    onClick?: () => void;
};

export default function Box(props: IBoxProps) {
    return (
        <button className={`${styles.box} ${styles[props.color]}`} onClick={props.onClick}>
            <Emoji className={styles.emoji} name={props.emoji} />
            <p className={`body-bold ${styles.title}`}>{props.title}</p>
            <p className={`alternative ${styles.text}`}>{props.text}</p>
        </button>
    )
}