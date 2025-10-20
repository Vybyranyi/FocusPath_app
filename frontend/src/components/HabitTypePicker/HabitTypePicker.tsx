import SegmentControl from '@components/SegmentControl/SegmentControl';
import styles from './HabitTypePicker.module.scss';

export default function HabitTypePicker() {
    const segments = [
        { id: 'build', label: 'Build' },
        { id: 'quit', label: 'Quit' },
    ];

    return (
        <div>
            <p className={`chip ${styles.label}`}>Choose the number of days</p>
            <SegmentControl
                segments={segments}
                defaultSelectedId='build'
                onSelect={(id) => console.log(id)}
            />
        </div>
    )
}