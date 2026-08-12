import OptionPicker, { PreviewFrame } from "@components/pickers/OptionPicker";
import type { Option } from "@/types/ui";

export type ColorOption =
  | 'white' | 'orange' | 'blue' | 'lightblue'
  | 'red' | 'yellow' | 'green' | 'purple' | 'teal';

const colorOptions: readonly Option<ColorOption>[] = [
  { label: 'White',      value: 'white' },
  { label: 'Orange',     value: 'orange' },
  { label: 'Blue',       value: 'blue' },
  { label: 'Light Blue', value: 'lightblue' },
  { label: 'Red',        value: 'red' },
  { label: 'Yellow',     value: 'yellow' },
  { label: 'Green',      value: 'green' },
  { label: 'Purple',     value: 'purple' },
  { label: 'Teal',       value: 'teal' },
];

const swatchBg: Record<ColorOption, string> = {
  white:     'bg-surface border border-ink-faint',
  orange:    'bg-s-orange-soft',
  blue:      'bg-brand-blue-20',
  lightblue: 'bg-info-soft',
  red:       'bg-danger-soft',
  yellow:    'bg-warning-soft',
  green:     'bg-success-soft',
  purple:    'bg-s-purple-soft',
  teal:      'bg-s-teal-soft',
};

export interface IColorPicker {
  disabled?: boolean;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function ColorPicker(props: IColorPicker) {
  return (
    <OptionPicker
      {...props}
      options={colorOptions}
      caption="Color"
      placeholder="Select Color"
      renderPreview={(option) => (
        <PreviewFrame
          className={
            option
              ? swatchBg[option.value]
              : 'bg-accent-soft text-ink-muted text-lg font-bold'
          }
        >
          {!option && '?'}
        </PreviewFrame>
      )}
    />
  );
}
