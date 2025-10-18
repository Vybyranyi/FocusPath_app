import Switch from '@components/Switch/Switch';
import styles from './DurationPicker.module.scss';

export interface IDurationPickerProps {
    aiEnabled: boolean;
    duration: string;
    onAiToggle: () => void;
    onDurationChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDurationBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    disabled?: boolean;
}

export default function DurationPicker(props: IDurationPickerProps) {
    return (
        <div className={styles.durationPickerWrapper}>
            <p className={`chip ${styles.label}`}>Choose the number of days</p>
            <div className={styles.durationPickerBlock}>
                <div className={styles.durationPickerTitle}>
                    <p className='alternative'>Let AI determine the optimal number of days</p>
                    <Switch 
                        toggled={props.aiEnabled}
                        onClick={props.onAiToggle}
                        disabled={props.disabled}
                    />
                </div>
                {!props.aiEnabled && (
                    <input 
                        type="number"
                        min="1"
                        max="365"
                        className={`${styles.durationPickerInput} ${props.error ? styles.error : ''}`}
                        value={props.duration}
                        onChange={props.onDurationChange}
                        onBlur={props.onDurationBlur}
                        placeholder="Enter number of days (1-365)"
                        disabled={props.disabled}
                    />
                )}
            </div>
            {props.error && (
                <div className={styles.errorPopup}>
                    <span className="alternative">{props.error}</span>
                </div>
            )}
        </div>
    );
}