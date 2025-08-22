import styles from '@components/Button/Button.module.scss'

export interface IButtonProps {
    type: "primary" | "secondary" | "outline";
    disabled?: boolean;
    size: "small" | "medium" | "large";
    htmlType?: "button" | "submit" | "reset";
    icon?: string;
    children: string;
    onClick?: () => void;
};

export default function Button(props: IButtonProps) {
    return (
        <button
            type={props.htmlType}
            className={`${styles.btn} ${styles[props.type]} ${styles[props.size]} ${props.disabled ? styles.disabled : ""}`}
            disabled={props.disabled}
            onClick={props.onClick}
        >
            {props.icon && <img src={props.icon} alt="icon" />}
            <span className="body-bold">{props.children}</span>
        </button>
    );
}