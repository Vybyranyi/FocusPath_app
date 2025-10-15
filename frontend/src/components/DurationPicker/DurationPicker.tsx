import Switch from '@components/Switch/Switch';
import styles from './DurationPicker.module.scss';

export default function DurationPicker() {
    return (
        <div className={styles.durationPickerBlock}>
            <div className={styles.durationPickerTitle}>
                <p className='alternative'>Let AI determine the optimal number of days</p>
                <Switch />
            </div>
            <input type="text" className={styles.durationPickerInput}/>
        </div>
    );
};