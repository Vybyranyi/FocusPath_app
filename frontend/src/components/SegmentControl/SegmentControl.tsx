import styles from '@components/SegmentControl/SegmentControl.module.scss';
import { useState } from 'react';

export interface Segment {
    id: string;
    label: string;
    notifications?: number
}

export interface ISegmentControl {
    segments: Segment[];
    defaultSelectedId: string;
    onSelect: (selectedId: string) => void;

}

export default function SegmentControl(props: ISegmentControl) {
    const [selectedId, setSelectedId] = useState<string>(props.defaultSelectedId);

    const handleSegmentClick = (id: string) => {
        setSelectedId(id);
        props.onSelect(id);
    };

    return (
        <div className={styles.segmentedControl}>
            {props.segments.map((segment) => (
                <p
                    key={segment.id}
                    className={`body-bold ${styles.segmentButton} ${selectedId === segment.id ? styles.active : ''}`}
                    onClick={() => handleSegmentClick(segment.id)}
                >
                    {segment.label}
                </p>
            ))}
        </div>
    )
}