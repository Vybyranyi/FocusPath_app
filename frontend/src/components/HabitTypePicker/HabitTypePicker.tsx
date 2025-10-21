import SegmentControl from '@components/SegmentControl/SegmentControl';
import styles from './HabitTypePicker.module.scss';

export interface IHabitTypePickerProps {
    value?: 'build' | 'quit';
    onSelect: (type: 'build' | 'quit') => void;
    error?: string;
}

export default function HabitTypePicker(props: IHabitTypePickerProps) {
    const segments = [
        { id: 'build', label: 'Build' },
        { id: 'quit', label: 'Quit' },
    ];

    return (
        <div className={styles.wrapper}>
            <p className={`chip ${styles.label}`}>Habit type</p>
            <SegmentControl
                segments={segments}
                defaultSelectedId={props.value || 'build'}
                onSelect={(id) => props.onSelect(id as 'build' | 'quit')}
            />
            {props.error && (
                <div className={styles.errorPopup}>
                    <span className="alternative">{props.error}</span>
                </div>
            )}
        </div>
    )
}