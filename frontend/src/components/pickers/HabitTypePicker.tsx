import FieldError from "@components/ui/FieldError";
import SegmentControl from '@components/ui/SegmentControl';

export interface IHabitTypePickerProps {
  value?: 'build' | 'quit';
  onSelect: (type: 'build' | 'quit') => void;
  error?: string;
}

const segments = [
  { id: 'build', label: 'Build' },
  { id: 'quit',  label: 'Quit' },
];

export default function HabitTypePicker({ value, onSelect, error }: IHabitTypePickerProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="field-label mb-1.5">Habit type</p>
      <SegmentControl
        segments={segments}
        defaultSelectedId={value ?? 'build'}
        label="Habit type"
        onSelect={id => onSelect(id as 'build' | 'quit')}
      />
      <FieldError message={error} className="mt-0" />
    </div>
  );
}
