import styles from '@components/DatePicker/DatePicker.module.scss';

export interface IDatePicker {
    date: Date | string | number;
    active?: boolean;
    error?: boolean
    onClick?: () => void;
};

const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function DatePicker(props: IDatePicker) {
    const parsedDate = new Date(props.date);
    const day = parsedDate.getDate();
    const weekday = weekdays[parsedDate.getDay()];

    return (
        <div
            className={`${styles.datePicker} ${props.active ? styles.active : ""} ${props.error ? styles.error : ""}`}
            onClick={props.onClick}
        >
            <h6 className={styles.day}>{day}</h6>
            <div className={`chip ${styles.weekday}`}>{weekday}</div>
        </div>
    )
}