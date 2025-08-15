import styles from '@components/IconButton/IconButton.module.scss';
import { Emoji } from 'react-apple-emojis';

export interface IIconButtonProps {
    emoji?: string;
    icon?: string;
    size: "small" | "medium" | "large";
    onClick?: () => void;
    show_dot?: boolean;
}

export default function IconButton(props: IIconButtonProps) {
    return (
        <button className={`${styles.iconButton} ${styles[props.size]}`} onClick={props.onClick}>
            {props.emoji && (
                <Emoji className={styles.emoji} name={props.emoji} />
            )}
            {props.icon && (
                <img className={styles.icon} src={props.icon} alt="icon" />
            )}
            {props.show_dot && (
                <span className={styles.dot} />
            )}
        </button>
    )
}